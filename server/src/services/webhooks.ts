import { createHmac } from 'node:crypto';
import { prisma } from '../lib/prisma.js';

export async function dispatchOrderStatusWebhooks(params: {
  orderId: string;
  status: string;
  sellerIds: string[];
}) {
  const subs = await prisma.webhookSubscription.findMany({
    where: {
      isActive: true,
      OR: [{ sellerId: { in: params.sellerIds } }, { sellerId: null }],
      events: { has: 'order.status_changed' },
    },
  });

  const body = JSON.stringify({
    event: 'order.status_changed',
    orderId: params.orderId,
    status: params.status,
    timestamp: new Date().toISOString(),
  });

  await Promise.allSettled(
    subs.map(async (sub) => {
      const signature = createHmac('sha256', sub.secret).update(body).digest('hex');
      const res = await fetch(sub.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-GoShopix-Signature': signature,
        },
        body,
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) {
        throw new Error(`Webhook ${sub.url} returned ${res.status}`);
      }
    }),
  );
}
