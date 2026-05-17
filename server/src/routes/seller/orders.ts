import { OrderStatus } from '@prisma/client';
import { Router } from 'express';
import { AppError } from '../../lib/errors.js';
import { getAllowedTransitions } from '../../lib/order-status-rules.js';
import { getStatusDefinition } from '@goshopix/shared';
import { changeOrderStatus } from '../../services/order-status.js';
import { paginatedMeta, parsePagination, skipTake } from '../../lib/pagination.js';
import { prisma } from '../../lib/prisma.js';
import { ok } from '../../lib/response.js';
import { requireSeller } from '../../middleware/seller.js';
import { validate } from '../../middleware/validate.js';
import {
  sellerOrderParamsSchema,
  sellerOrdersQuerySchema,
  updateOrderStatusSchema,
} from '../../schemas/seller/orders.js';
import {
  assertOrderHasSellerItems,
  orderBelongsToSellerOnly,
} from '../../services/seller.js';
import { mapSellerOrderItem, mapSellerOrderView } from '../../mappers/seller-order.js';
import { paramString } from '../../utils/params.js';

export const sellerOrdersRouter = Router();

sellerOrdersRouter.use(...requireSeller);

sellerOrdersRouter.get('/', validate({ query: sellerOrdersQuerySchema }), async (req, res, next) => {
  try {
    const sellerId = req.seller!.id;
    const query = req.query as unknown as {
      page: number;
      limit: number;
      status?: OrderStatus;
      from?: Date;
      to?: Date;
    };
    const pagination = parsePagination(query.page, query.limit);

    const orderFilter: {
      status?: OrderStatus;
      createdAt?: { gte?: Date; lte?: Date };
    } = {};
    if (query.status) orderFilter.status = query.status;
    if (query.from || query.to) {
      orderFilter.createdAt = {
        ...(query.from ? { gte: query.from } : {}),
        ...(query.to ? { lte: query.to } : {}),
      };
    }

    const orderIds = await prisma.orderItem.findMany({
      where: {
        variant: { product: { sellerId } },
        order: orderFilter,
      },
      select: { orderId: true },
      distinct: ['orderId'],
    });

    const ids = orderIds.map((o) => o.orderId);
    const total = ids.length;

    const { skip, take } = skipTake(pagination);
    const pageIds = ids.slice(skip, skip + take);

    const orders = await prisma.order.findMany({
      where: { id: { in: pageIds } },
      include: {
        items: {
          include: {
            variant: {
              include: { product: { select: { id: true, name: true, sellerId: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const items = orders.map((order) => {
      const sellerItems = order.items.filter((i) => i.variant?.product.sellerId === sellerId);
      const sellerRevenue = sellerItems.reduce((s, i) => s + i.lineTotal.toNumber(), 0);
      return mapSellerOrderView(order, sellerItems, sellerRevenue);
    });

    ok(res, { items, meta: paginatedMeta(total, pagination) });
  } catch (error) {
    next(error);
  }
});

sellerOrdersRouter.get(
  '/:id',
  validate({ params: sellerOrderParamsSchema }),
  async (req, res, next) => {
    try {
      const orderId = paramString(req.params.id);
      const { order, sellerItems } = await assertOrderHasSellerItems(orderId, req.seller!.id);
      const sellerRevenue = sellerItems.reduce((s, i) => s + i.lineTotal.toNumber(), 0);

      ok(res, {
        ...mapSellerOrderView(order, sellerItems, sellerRevenue),
        history: order.history.map((h) => ({
          id: h.id,
          status: h.status,
          note: h.note,
          reason: h.reason ?? h.note,
          actorRole: h.actorRole,
          statusMeta: getStatusDefinition(h.status) ?? null,
          createdAt: h.createdAt.toISOString(),
        })),
        tracking: {
          number: order.trackingNumber,
          carrier: order.carrier,
          carrierStatus: order.carrierStatus,
          carrierStatusAt: order.carrierStatusAt?.toISOString() ?? null,
        },
        allowedStatusTransitions: getAllowedTransitions(order.status, 'SELLER'),
        multiSeller: !orderBelongsToSellerOnly(order, req.seller!.id),
      });
    } catch (error) {
      next(error);
    }
  },
);

sellerOrdersRouter.get(
  '/:id/items',
  validate({ params: sellerOrderParamsSchema }),
  async (req, res, next) => {
    try {
      const orderId = paramString(req.params.id);
      const { sellerItems } = await assertOrderHasSellerItems(orderId, req.seller!.id);
      ok(res, sellerItems.map(mapSellerOrderItem));
    } catch (error) {
      next(error);
    }
  },
);

sellerOrdersRouter.put(
  '/:id/status',
  validate({ params: sellerOrderParamsSchema, body: updateOrderStatusSchema }),
  async (req, res, next) => {
    try {
      const orderId = paramString(req.params.id);
      const sellerId = req.seller!.id;
      const { status: nextStatus, note } = req.body;

      const { order, sellerItems } = await assertOrderHasSellerItems(orderId, sellerId);

      if (!orderBelongsToSellerOnly(order, sellerId)) {
        throw new AppError(
          400,
          'Cannot update status: order contains items from other sellers',
        );
      }

      await changeOrderStatus({
        orderId,
        nextStatus,
        note: note ?? 'Статус изменён продавцом',
        reason: note,
        actorUserId: req.seller!.userId,
        actorRole: 'SELLER',
        assignTracking: nextStatus === OrderStatus.shipped,
      });

      const updated = await prisma.order.findUniqueOrThrow({
        where: { id: orderId },
        include: { history: { orderBy: { createdAt: 'asc' } } },
      });

      const sellerRevenue = sellerItems.reduce((s, i) => s + i.lineTotal.toNumber(), 0);

      ok(res, {
        ...mapSellerOrderView(updated, sellerItems, sellerRevenue),
        history: updated.history.map((h) => ({
          id: h.id,
          status: h.status,
          note: h.note,
          createdAt: h.createdAt.toISOString(),
        })),
      });
    } catch (error) {
      next(error);
    }
  },
);
