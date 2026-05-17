import { prisma } from '../lib/prisma.js';

const CARRIERS = ['cdek', 'boxberry', 'russian_post'] as const;

export function generateTrackingNumber(carrier: string): string {
  const prefix = carrier.slice(0, 3).toUpperCase();
  const num = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `${prefix}${Date.now().toString(36).toUpperCase()}${num}`;
}

export function pickCarrier(): string {
  return CARRIERS[Math.floor(Math.random() * CARRIERS.length)]!;
}

/** Мок проверки статуса у курьера */
export async function checkCarrierStatus(orderId: string): Promise<{
  carrierStatus: string;
  delivered: boolean;
}> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order?.trackingNumber) {
    return { carrierStatus: 'unknown', delivered: false };
  }

  const roll = Math.random();
  if (roll > 0.85) {
    return { carrierStatus: 'delivered', delivered: true };
  }
  if (roll > 0.5) {
    return { carrierStatus: 'in_transit', delivered: false };
  }
  return { carrierStatus: 'accepted', delivered: false };
}

export async function assignTracking(orderId: string) {
  const carrier = pickCarrier();
  const trackingNumber = generateTrackingNumber(carrier);
  return prisma.order.update({
    where: { id: orderId },
    data: {
      carrier,
      trackingNumber,
      carrierStatus: 'accepted',
      carrierStatusAt: new Date(),
    },
  });
}
