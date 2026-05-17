import { createHmac, timingSafeEqual } from 'node:crypto';
import { OrderStatus } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../lib/errors.js';
import { ok } from '../lib/response.js';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { changeOrderStatus } from '../services/order-status.js';

export const webhooksRouter = Router();

const courierPayloadSchema = z.object({
  trackingNumber: z.string().min(1),
  status: z.enum(['in_transit', 'delivered', 'returned', 'exception']),
  note: z.string().optional(),
});

/** Входящий webhook от курьерской службы */
webhooksRouter.post('/courier', validate({ body: courierPayloadSchema }), async (req, res, next) => {
  try {
    const secret = process.env.COURIER_WEBHOOK_SECRET;
    if (secret) {
      const sig = req.headers['x-courier-signature'];
      if (typeof sig !== 'string') throw new AppError(401, 'Missing signature');
      const expected = createHmac('sha256', secret)
        .update(JSON.stringify(req.body))
        .digest('hex');
      const a = Buffer.from(sig);
      const b = Buffer.from(expected);
      if (a.length !== b.length || !timingSafeEqual(a, b)) {
        throw new AppError(401, 'Invalid signature');
      }
    }

    const { trackingNumber, status, note } = req.body;
    const order = await prisma.order.findFirst({ where: { trackingNumber } });
    if (!order) throw new AppError(404, 'Order not found for tracking number');

    await prisma.order.update({
      where: { id: order.id },
      data: { carrierStatus: status, carrierStatusAt: new Date() },
    });

    if (status === 'delivered' && order.status === OrderStatus.shipped) {
      await changeOrderStatus({
        orderId: order.id,
        nextStatus: OrderStatus.delivered,
        reason: note ?? 'Доставлено (webhook курьера)',
        actorRole: 'SYSTEM',
        assignTracking: false,
      });
    }

    ok(res, { received: true, orderId: order.id });
  } catch (error) {
    next(error);
  }
});

const subscribeSchema = z.object({
  url: z.string().url(),
  secret: z.string().min(8).optional(),
  events: z.array(z.string()).optional(),
});

/** Подписка продавца на исходящие webhooks */
webhooksRouter.post(
  '/subscribe',
  authenticate,
  requireRole('SELLER', 'ADMIN'),
  validate({ body: subscribeSchema }),
  async (req, res, next) => {
    try {
      const seller = await prisma.seller.findUnique({ where: { userId: req.user!.sub } });
      if (!seller) throw new AppError(403, 'Seller profile required');

      const body = req.body as z.infer<typeof subscribeSchema>;
      const secret = body.secret ?? createHmac('sha256', process.env.JWT_SECRET ?? 'dev')
        .update(body.url)
        .digest('hex')
        .slice(0, 32);

      const sub = await prisma.webhookSubscription.create({
        data: {
          sellerId: seller.id,
          url: body.url,
          secret,
          events: body.events ?? ['order.status_changed'],
        },
      });

      ok(res, { id: sub.id, url: sub.url, events: sub.events }, 201);
    } catch (error) {
      next(error);
    }
  },
);
