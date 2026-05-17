import { getStatusDefinition } from '@goshopix/shared';
import { prisma } from '../lib/prisma.js';
import { JobType } from '@prisma/client';
import { enqueueJob } from './queue.js';

export async function getOrCreateNotificationSettings(userId: string) {
  return prisma.userNotificationSettings.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

export async function createOrderStatusNotification(params: {
  userId: string;
  orderId: string;
  status: string;
  reason?: string;
}) {
  const settings = await getOrCreateNotificationSettings(params.userId);
  if (!settings.inAppOrderStatus) return null;

  const def = getStatusDefinition(params.status);
  const title = `Заказ #${params.orderId.slice(0, 8)}`;
  const body = def
    ? `${def.name}${params.reason ? `: ${params.reason}` : ''}`
    : `Статус: ${params.status}`;

  return prisma.notification.create({
    data: {
      userId: params.userId,
      type: 'order_status',
      title,
      body,
      data: { orderId: params.orderId, status: params.status },
    },
  });
}

export async function notifyOrderStatusChange(params: {
  orderId: string;
  userId: string;
  status: string;
  reason?: string;
  sellerIds?: string[];
}) {
  await createOrderStatusNotification(params);

  await enqueueJob(JobType.SEND_EMAIL, {
    orderId: params.orderId,
    userId: params.userId,
    status: params.status,
  });

  if (params.sellerIds?.length) {
    await enqueueJob(JobType.SEND_WEBHOOK, {
      orderId: params.orderId,
      status: params.status,
      sellerIds: params.sellerIds,
    });
  }

  if (params.status === 'shipped') {
    await enqueueJob(
      JobType.CHECK_CARRIER_STATUS,
      { orderId: params.orderId },
      { runAt: new Date(Date.now() + 30_000) },
    );
  }
}
