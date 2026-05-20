import { OrderStatus } from '@prisma/client';

import { getStatusDefinition } from '@goshopix/shared';

import { Router } from 'express';

import { AppError } from '../lib/errors.js';

import { getAllowedTransitions } from '../lib/order-status-rules.js';

import { paginatedMeta, parsePagination, skipTake } from '../lib/pagination.js';

import { prisma } from '../lib/prisma.js';

import { ok } from '../lib/response.js';

import { requireCustomer } from '../middleware/auth.js';

import { validate } from '../middleware/validate.js';

import { createOrderSchema, orderParamsSchema, ordersQuerySchema, paymentRedirectSchema } from '../schemas/orders.js';

import { getOrCreateCart } from '../services/cart.js';

import { changeOrderStatus, confirmOrderPayment } from '../services/order-status.js';

import { paramString } from '../utils/params.js';



export const ordersRouter = Router();



ordersRouter.use(...requireCustomer);



const orderInclude = {

  items: true,

  history: { orderBy: { createdAt: 'asc' as const } },

};



function mapHistoryEntry(h: {

  id: string;

  status: OrderStatus;

  note: string | null;

  reason: string | null;

  actorRole: string | null;

  createdAt: Date;

}) {

  const def = getStatusDefinition(h.status);

  return {

    id: h.id,

    status: h.status,

    note: h.note,

    reason: h.reason ?? h.note,

    actorRole: h.actorRole,

    statusMeta: def ?? null,

    createdAt: h.createdAt.toISOString(),

  };

}



function mapOrder(

  order: {

    id: string;

    status: OrderStatus;

    totalAmount: { toNumber: () => number };

    shippingName: string | null;

    shippingPhone: string | null;

    shippingAddress: string | null;

    paymentMethod: string | null;

    trackingNumber: string | null;

    carrier: string | null;

    carrierStatus: string | null;

    carrierStatusAt: Date | null;

    createdAt: Date;

    updatedAt: Date;

    items: {

      id: string;

      productName: string;

      variantName: string | null;

      unitPrice: { toNumber: () => number };

      quantity: number;

      lineTotal: { toNumber: () => number };

      variantId: string | null;

    }[];

    history: {

      id: string;

      status: OrderStatus;

      note: string | null;

      reason: string | null;

      actorRole: string | null;

      createdAt: Date;

    }[];

  },

  actorRole: 'CUSTOMER' | 'ADMIN' = 'CUSTOMER',

) {

  const statusMeta = getStatusDefinition(order.status);

  return {

    id: order.id,

    status: order.status,

    statusMeta: statusMeta ?? null,

    allowedTransitions: getAllowedTransitions(order.status, actorRole),

    totalAmount: order.totalAmount.toNumber(),

    tracking: {

      number: order.trackingNumber,

      carrier: order.carrier,

      carrierStatus: order.carrierStatus,

      carrierStatusAt: order.carrierStatusAt?.toISOString() ?? null,

    },

    shipping: {

      name: order.shippingName,

      phone: order.shippingPhone,

      address: order.shippingAddress,

    },

    paymentMethod: order.paymentMethod ?? null,

    items: order.items.map((i) => ({

      id: i.id,

      productName: i.productName,

      variantName: i.variantName,

      unitPrice: i.unitPrice.toNumber(),

      quantity: i.quantity,

      lineTotal: i.lineTotal.toNumber(),

      variantId: i.variantId,

    })),

    history: order.history.map(mapHistoryEntry),

    createdAt: order.createdAt.toISOString(),

    updatedAt: order.updatedAt.toISOString(),

  };

}



ordersRouter.post('/', validate({ body: createOrderSchema }), async (req, res, next) => {

  try {

    const userId = req.user!.sub;

    const { shippingName, shippingPhone, shippingAddress, paymentMethod, deliveryMethod, customerNote } =
      req.body;

    const carrier =
      deliveryMethod === 'cdek' ? 'СДЭК' : deliveryMethod === 'post' ? 'Почта России' : undefined;

    const historyNote = [
      'Заказ создан',
      carrier ? `Доставка: ${carrier}` : null,
      customerNote?.trim() ? `Комментарий: ${customerNote.trim()}` : null,
    ]
      .filter(Boolean)
      .join(' · ');



    const cart = await getOrCreateCart(userId);

    if (cart.items.length === 0) {

      throw new AppError(400, 'Cart is empty');

    }



    for (const item of cart.items) {

      if (item.variant.stock < item.quantity) {

        throw new AppError(400, `Insufficient stock for ${item.variant.sku}`);

      }

    }



    const order = await prisma.$transaction(async (tx) => {

      let total = 0;

      const orderItemsData = cart.items.map((item) => {

        const unitPrice = item.variant.price;

        const lineTotal = unitPrice.toNumber() * item.quantity;

        total += lineTotal;

        return {

          variantId: item.variant.id,

          productName: item.variant.product.name,

          variantName: item.variant.name,

          unitPrice,

          quantity: item.quantity,

          lineTotal,

        };

      });



      const created = await tx.order.create({

        data: {

          userId,

          status: OrderStatus.pending,

          totalAmount: total,

          shippingName,

          shippingPhone,

          shippingAddress,

          carrier,

          paymentMethod: paymentMethod === 'cash' || paymentMethod === 'card' || paymentMethod === 'sbp' ? paymentMethod : 'card',

          items: { create: orderItemsData },

          history: {

            create: {

              status: OrderStatus.pending,

              note: historyNote,

              reason: 'Заказ создан',

              actorRole: 'SYSTEM',

            },

          },

        },

        include: orderInclude,

      });



      for (const item of cart.items) {

        await tx.productVariant.update({

          where: { id: item.variant.id },

          data: { stock: { decrement: item.quantity } },

        });

      }



      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });



      return created;

    });



    ok(res, mapOrder(order), 201);

  } catch (error) {

    next(error);

  }

});

ordersRouter.post(
  '/:id/payment-redirect',
  validate({ params: orderParamsSchema, body: paymentRedirectSchema }),
  async (req, res, next) => {
    try {
      const orderId = paramString(req.params.id);
      const { paymentMethod, returnUrl } = req.body as { paymentMethod: 'card' | 'sbp'; returnUrl?: string };

      const order = await prisma.order.findFirst({
        where: { id: orderId, userId: req.user!.sub },
        select: { id: true, status: true },
      });

      if (!order) throw new AppError(404, 'Order not found');
      if (order.status !== OrderStatus.pending) throw new AppError(400, 'Order is not payable');

      // MVP: редирект на внутреннюю "страницу шлюза". Интеграцию с реальным PSP можно подменить здесь.
      const safeReturnUrl = typeof returnUrl === 'string' && returnUrl.length > 0 ? returnUrl : '/checkout/confirmation';
      const redirectUrl =
        `/pay?orderId=${encodeURIComponent(order.id)}` +
        `&method=${encodeURIComponent(paymentMethod)}` +
        `&returnUrl=${encodeURIComponent(safeReturnUrl)}`;

      ok(res, { redirectUrl });
    } catch (error) {
      next(error);
    }
  },
);



ordersRouter.get('/', validate({ query: ordersQuerySchema }), async (req, res, next) => {

  try {

    const { page, limit } = req.query as unknown as { page: number; limit: number };

    const pagination = parsePagination(page, limit);

    const userId = req.user!.sub;

    const role = req.user!.role;



    const where = { userId };



    const [total, orders] = await Promise.all([

      prisma.order.count({ where }),

      prisma.order.findMany({

        where,

        include: orderInclude,

        orderBy: { createdAt: 'desc' },

        ...skipTake(pagination),

      }),

    ]);



    ok(res, {

      items: orders.map((o) => mapOrder(o, role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER')),

      meta: paginatedMeta(total, pagination),

    });

  } catch (error) {

    next(error);

  }

});



ordersRouter.get('/:id', validate({ params: orderParamsSchema }), async (req, res, next) => {

  try {

    const orderId = paramString(req.params.id);

    const order = await prisma.order.findFirst({

      where: { id: orderId, userId: req.user!.sub },

      include: orderInclude,

    });



    if (!order) {

      throw new AppError(404, 'Order not found');

    }



    ok(res, mapOrder(order));

  } catch (error) {

    next(error);

  }

});



ordersRouter.post('/:id/pay', validate({ params: orderParamsSchema }), async (req, res, next) => {

  try {

    const orderId = paramString(req.params.id);

    const updated = await confirmOrderPayment(orderId, req.user!.sub);

    const full = await prisma.order.findUniqueOrThrow({

      where: { id: updated.id },

      include: orderInclude,

    });

    ok(res, mapOrder(full));

  } catch (error) {

    next(error);

  }

});



ordersRouter.post(

  '/:id/cancel',

  validate({ params: orderParamsSchema }),

  async (req, res, next) => {

    try {

      const orderId = paramString(req.params.id);

      const order = await prisma.order.findFirst({

        where: { id: orderId, userId: req.user!.sub },

      });



      if (!order) {

        throw new AppError(404, 'Order not found');

      }



      await changeOrderStatus({

        orderId: order.id,

        nextStatus: OrderStatus.cancelled,

        reason: 'Отменён покупателем',

        actorUserId: req.user!.sub,

        actorRole: req.user!.role,

      });



      const full = await prisma.order.findUniqueOrThrow({

        where: { id: orderId },

        include: orderInclude,

      });

      ok(res, mapOrder(full));

    } catch (error) {

      next(error);

    }

  },

);


