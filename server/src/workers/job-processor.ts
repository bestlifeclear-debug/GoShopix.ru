import { JobType, OrderStatus } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { changeOrderStatus } from '../services/order-status.js';
import { sendOrderStatusEmail } from '../services/email.js';
import { checkCarrierStatus } from '../services/shipping.js';
import { dispatchOrderStatusWebhooks } from '../services/webhooks.js';
import { claimNextJob, completeJob, failJob } from '../services/queue.js';

async function processJob(job: { id: string; type: JobType; payload: unknown }) {
  const payload = job.payload as Record<string, unknown>;

  switch (job.type) {
    case JobType.SEND_EMAIL: {
      const order = await prisma.order.findUnique({
        where: { id: payload.orderId as string },
        include: { user: { include: { profile: true } } },
      });
      if (!order) return;
      await sendOrderStatusEmail({
        orderId: order.id,
        userId: order.userId,
        status: (payload.status as string) ?? order.status,
        customerEmail: order.user.email,
        customerName: order.user.profile?.firstName ?? null,
        orderTotal: order.totalAmount.toNumber(),
        trackingNumber: order.trackingNumber,
      });
      break;
    }
    case JobType.SEND_WEBHOOK: {
      await dispatchOrderStatusWebhooks({
        orderId: payload.orderId as string,
        status: payload.status as string,
        sellerIds: (payload.sellerIds as string[]) ?? [],
      });
      break;
    }
    case JobType.CHECK_CARRIER_STATUS: {
      const orderId = payload.orderId as string;
      const result = await checkCarrierStatus(orderId);
      await prisma.order.update({
        where: { id: orderId },
        data: {
          carrierStatus: result.carrierStatus,
          carrierStatusAt: new Date(),
        },
      });
      if (result.delivered) {
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (order?.status === OrderStatus.shipped) {
          await changeOrderStatus({
            orderId,
            nextStatus: OrderStatus.delivered,
            reason: 'Подтверждено службой доставки',
            actorRole: 'SYSTEM',
          });
        }
      }
      break;
    }
    case JobType.AUTO_ORDER_STATUS: {
      const order = await prisma.order.findUnique({
        where: { id: payload.orderId as string },
      });
      const target = payload.targetStatus as OrderStatus;
      if (order && order.status !== target) {
        await changeOrderStatus({
          orderId: order.id,
          nextStatus: target,
          reason: 'Автоматический переход',
          actorRole: 'SYSTEM',
          assignTracking: false,
        });
      }
      break;
    }
    default:
      break;
  }
}

let workerTimer: ReturnType<typeof setInterval> | null = null;

export function startJobWorker(intervalMs = 3000) {
  if (workerTimer) return;

  const tick = async () => {
    try {
      const job = await claimNextJob();
      if (!job) return;
      try {
        await processJob(job);
        await completeJob(job.id);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        await failJob(job.id, msg);
      }
    } catch {
      // DB unavailable or transient error — skip tick without crashing the API process
    }
  };

  workerTimer = setInterval(() => {
    void tick();
  }, intervalMs);
  console.log(`Background job worker started (every ${intervalMs}ms)`);
}

export function stopJobWorker() {
  if (workerTimer) {
    clearInterval(workerTimer);
    workerTimer = null;
  }
}
