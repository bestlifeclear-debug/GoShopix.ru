import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { ok } from '../../lib/response.js';
import { requireSeller } from '../../middleware/seller.js';
import { fetchSellerOrderItems, groupSalesByPeriod } from '../../services/analytics.js';
import { mapSellerOrderView } from '../../mappers/seller-order.js';

export const sellerDashboardRouter = Router();

sellerDashboardRouter.use(...requireSeller);

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return startOfDay(d);
}

sellerDashboardRouter.get('/', async (req, res, next) => {
  try {
    const sellerId = req.seller!.id;
    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = daysAgo(7);
    const monthStart = daysAgo(30);

    const [todayItems, weekItems, monthItems] = await Promise.all([
      fetchSellerOrderItems(sellerId, { from: todayStart, to: now }),
      fetchSellerOrderItems(sellerId, { from: weekStart, to: now }),
      fetchSellerOrderItems(sellerId, { from: monthStart, to: now }),
    ]);

    const sumRevenue = (items: typeof todayItems) =>
      Math.round(items.reduce((s, i) => s + i.lineTotal.toNumber(), 0) * 100) / 100;

    const chartData = groupSalesByPeriod(monthItems, 'day').slice(-14);

    const orderIds = await prisma.orderItem.findMany({
      where: { variant: { product: { sellerId } } },
      select: { orderId: true },
      distinct: ['orderId'],
      orderBy: { orderId: 'desc' },
      take: 50,
    });

    const recentOrderRows = await prisma.order.findMany({
      where: { id: { in: orderIds.map((o) => o.orderId) } },
      include: {
        items: {
          include: {
            variant: { include: { product: { select: { id: true, sellerId: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const recentOrders = recentOrderRows.map((order) => {
      const sellerItems = order.items.filter((i) => i.variant?.product.sellerId === sellerId);
      const sellerRevenue = sellerItems.reduce((s, i) => s + i.lineTotal.toNumber(), 0);
      return mapSellerOrderView(order, sellerItems, sellerRevenue);
    });

    const variants = await prisma.productVariant.findMany({
      where: {
        product: { sellerId },
        stock: { lte: 5 },
      },
      include: {
        product: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { stock: 'asc' },
      take: 10,
    });

    const lowStock = variants.map((v) => ({
      variantId: v.id,
      productId: v.product.id,
      productName: v.product.name,
      sku: v.sku,
      variantName: v.name,
      stock: v.stock,
      price: v.price.toNumber(),
    }));

    ok(res, {
      metrics: {
        today: { revenue: sumRevenue(todayItems), orders: new Set(todayItems.map((i) => i.orderId)).size },
        week: { revenue: sumRevenue(weekItems), orders: new Set(weekItems.map((i) => i.orderId)).size },
        month: { revenue: sumRevenue(monthItems), orders: new Set(monthItems.map((i) => i.orderId)).size },
      },
      chart: chartData,
      recentOrders,
      lowStock,
    });
  } catch (error) {
    next(error);
  }
});
