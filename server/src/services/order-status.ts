import { OrderStatus, UserRole } from '@prisma/client';
import { getStatusDefinition, ORDER_STATUS_DEFINITIONS } from '@goshopix/shared';
import { AppError } from '../lib/errors.js';
import {
  assertStatusTransition,
  AUTO_AFTER,
  getAllowedTransitions,
  toActorRole,
} from '../lib/order-status-rules.js';
import { prisma } from '../lib/prisma.js';
import { JobType } from '@prisma/client';
import { notifyOrderStatusChange } from './notifications.js';
import { enqueueJob } from './queue.js';

export { ORDER_STATUS_DEFINITIONS, getStatusDefinition };

export async function getSellerIdsForOrder(orderId: string): Promise<string[]> {
  const items = await prisma.orderItem.findMany({
    where: { orderId },
    select: { variant: { select: { product: { select: { sellerId: true } } } } },
  });
  return [...new Set(items.map((i) => i.variant?.product.sellerId).filter(Boolean))] as string[];
}

export interface ChangeOrderStatusInput {
  orderId: string;
  nextStatus: OrderStatus;
  reason?: string;
  note?: string;
  actorUserId?: string;
  actorRole: UserRole | 'SYSTEM';
  /** При shipped — сгенерировать трек-номер */
  assignTracking?: boolean;
}

export async function changeOrderStatus(input: ChangeOrderStatusInput) {
  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
    include: {
      user: { select: { id: true, email: true, profile: { select: { name: true } } } },
      items: { include: { variant: true } },
    },
  });

  if (!order) throw new AppError(404, 'Order not found');

  assertStatusTransition(order.status, input.nextStatus, input.actorRole);

  const historyNote = input.note ?? input.reason ?? getStatusDefinition(input.nextStatus)?.name;

  const updated = await prisma.$transaction(async (tx) => {
    if (input.nextStatus === OrderStatus.cancelled) {
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    }

    let trackingData = {};
    if (input.nextStatus === OrderStatus.shipped && input.assignTracking !== false) {
      const carrier = 'cdek';
      const trackingNumber = `GSX${Date.now().toString(36).toUpperCase()}`;
      trackingData = {
        carrier,
        trackingNumber,
        carrierStatus: 'accepted',
        carrierStatusAt: new Date(),
      };
    }

    return tx.order.update({
      where: { id: input.orderId },
      data: {
        status: input.nextStatus,
        ...trackingData,
        history: {
          create: {
            status: input.nextStatus,
            note: historyNote,
            reason: input.reason ?? null,
            changedById: input.actorUserId ?? null,
            actorRole: toActorRole(input.actorRole),
          },
        },
      },
      include: {
        history: { orderBy: { createdAt: 'asc' } },
        items: true,
      },
    });
  });

  const sellerIds = await getSellerIdsForOrder(input.orderId);
  await notifyOrderStatusChange({
    orderId: input.orderId,
    userId: order.userId,
    status: input.nextStatus,
    reason: input.reason,
    sellerIds,
  });

  const autoNext = AUTO_AFTER[input.nextStatus];
  if (autoNext && autoNext !== input.nextStatus) {
    await enqueueJob(
      JobType.AUTO_ORDER_STATUS,
      { orderId: input.orderId, targetStatus: autoNext },
      { runAt: new Date(Date.now() + 2000) },
    );
  }

  return updated;
}

/** Оплата заказа: pending → processing */
export async function confirmOrderPayment(orderId: string, userId: string) {
  const order = await prisma.order.findFirst({ where: { id: orderId, userId } });
  if (!order) throw new AppError(404, 'Order not found');
  if (order.status !== OrderStatus.pending) {
    throw new AppError(400, 'Order is not awaiting payment');
  }
  return changeOrderStatus({
    orderId,
    nextStatus: OrderStatus.processing,
    reason: 'Оплата подтверждена',
    actorUserId: userId,
    actorRole: 'SYSTEM',
  });
}

export function mapOrderStatusMeta(status: OrderStatus) {
  const def = getStatusDefinition(status);
  return {
    status,
    ...def,
    allowedTransitions: [] as OrderStatus[],
  };
}

export function enrichOrderWithStatusMeta<T extends { status: OrderStatus }>(
  order: T,
  actorRole: UserRole | 'SYSTEM',
) {
  const def = getStatusDefinition(order.status);
  return {
    ...order,
    statusMeta: def ?? null,
    allowedTransitions: getAllowedTransitions(order.status, actorRole),
  };
}
