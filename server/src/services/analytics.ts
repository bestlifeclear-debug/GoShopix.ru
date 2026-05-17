import { OrderStatus } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

const COMPLETED_STATUSES: OrderStatus[] = [
  OrderStatus.processing,
  OrderStatus.shipped,
  OrderStatus.delivered,
];

export interface DateRange {
  from?: Date;
  to?: Date;
}

function periodKey(date: Date, groupBy: 'day' | 'week' | 'month'): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  if (groupBy === 'month') return `${y}-${m}`;
  if (groupBy === 'week') {
    const onejan = new Date(Date.UTC(y, 0, 1));
    const week = Math.ceil(((date.getTime() - onejan.getTime()) / 86400000 + onejan.getUTCDay() + 1) / 7);
    return `${y}-W${String(week).padStart(2, '0')}`;
  }
  return `${y}-${m}-${d}`;
}

export async function fetchSellerOrderItems(sellerId: string, range: DateRange) {
  return prisma.orderItem.findMany({
    where: {
      variant: { product: { sellerId } },
      order: {
        status: { in: COMPLETED_STATUSES },
        ...(range.from || range.to
          ? {
              createdAt: {
                ...(range.from ? { gte: range.from } : {}),
                ...(range.to ? { lte: range.to } : {}),
              },
            }
          : {}),
      },
    },
    select: {
      quantity: true,
      lineTotal: true,
      orderId: true,
      order: { select: { createdAt: true, status: true } },
      variant: {
        select: {
          productId: true,
          product: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  });
}

export function groupSalesByPeriod(
  items: Awaited<ReturnType<typeof fetchSellerOrderItems>>,
  groupBy: 'day' | 'week' | 'month',
) {
  const buckets = new Map<
    string,
    { period: string; orders: Set<string>; unitsSold: number; revenue: number }
  >();

  for (const item of items) {
    const key = periodKey(item.order.createdAt, groupBy);
    const bucket = buckets.get(key) ?? {
      period: key,
      orders: new Set<string>(),
      unitsSold: 0,
      revenue: 0,
    };
    bucket.orders.add(item.orderId);
    bucket.unitsSold += item.quantity;
    bucket.revenue += item.lineTotal.toNumber();
    buckets.set(key, bucket);
  }

  return [...buckets.values()]
    .map((b) => ({
      period: b.period,
      orderCount: b.orders.size,
      unitsSold: b.unitsSold,
      revenue: Math.round(b.revenue * 100) / 100,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));
}

export function groupRevenueByPeriod(
  items: Awaited<ReturnType<typeof fetchSellerOrderItems>>,
  groupBy: 'day' | 'week' | 'month',
) {
  return groupSalesByPeriod(items, groupBy).map(({ period, revenue, orderCount }) => ({
    period,
    revenue,
    orderCount,
  }));
}

function extractRegion(address: string | null): string {
  if (!address?.trim()) return 'Не указан';
  const city = address.split(',')[0]?.trim();
  return city || 'Не указан';
}

export async function fetchSellerOrdersGeography(sellerId: string, range: DateRange) {
  return prisma.order.findMany({
    where: {
      items: { some: { variant: { product: { sellerId } } } },
      status: { in: COMPLETED_STATUSES },
      ...(range.from || range.to
        ? {
            createdAt: {
              ...(range.from ? { gte: range.from } : {}),
              ...(range.to ? { lte: range.to } : {}),
            },
          }
        : {}),
    },
    select: {
      id: true,
      shippingAddress: true,
      items: {
        where: { variant: { product: { sellerId } } },
        select: { lineTotal: true, quantity: true },
      },
    },
  });
}

export function groupOrdersByGeography(
  orders: Awaited<ReturnType<typeof fetchSellerOrdersGeography>>,
) {
  const buckets = new Map<string, { region: string; orderCount: number; revenue: number; unitsSold: number }>();

  for (const order of orders) {
    const region = extractRegion(order.shippingAddress);
    const bucket = buckets.get(region) ?? { region, orderCount: 0, revenue: 0, unitsSold: 0 };
    bucket.orderCount += 1;
    for (const item of order.items) {
      bucket.revenue += item.lineTotal.toNumber();
      bucket.unitsSold += item.quantity;
    }
    buckets.set(region, bucket);
  }

  return [...buckets.values()]
    .map((b) => ({ ...b, revenue: Math.round(b.revenue * 100) / 100 }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function topProductsBySales(
  items: Awaited<ReturnType<typeof fetchSellerOrderItems>>,
  limit: number,
) {
  const byProduct = new Map<
    string,
    { productId: string; name: string; slug: string; unitsSold: number; revenue: number }
  >();

  for (const item of items) {
    const product = item.variant?.product;
    if (!product) continue;
    const row = byProduct.get(product.id) ?? {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      unitsSold: 0,
      revenue: 0,
    };
    row.unitsSold += item.quantity;
    row.revenue += item.lineTotal.toNumber();
    byProduct.set(product.id, row);
  }

  return [...byProduct.values()]
    .map((p) => ({ ...p, revenue: Math.round(p.revenue * 100) / 100 }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}
