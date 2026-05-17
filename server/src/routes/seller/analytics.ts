import { Router } from 'express';
import { ok } from '../../lib/response.js';
import { requireSeller } from '../../middleware/seller.js';
import { validate } from '../../middleware/validate.js';
import {
  analyticsPeriodSchema,
  topProductsQuerySchema,
} from '../../schemas/seller/analytics.js';
import {
  fetchSellerOrderItems,
  fetchSellerOrdersGeography,
  groupOrdersByGeography,
  groupRevenueByPeriod,
  groupSalesByPeriod,
  topProductsBySales,
} from '../../services/analytics.js';

export const sellerAnalyticsRouter = Router();

sellerAnalyticsRouter.use(...requireSeller);

function parseRange(query: { from?: Date; to?: Date }) {
  if (query.from && query.to && query.from > query.to) {
    return { from: query.to, to: query.from };
  }
  return { from: query.from, to: query.to };
}

sellerAnalyticsRouter.get(
  '/sales',
  validate({ query: analyticsPeriodSchema }),
  async (req, res, next) => {
    try {
      const query = req.query as unknown as {
        from?: Date;
        to?: Date;
        groupBy: 'day' | 'week' | 'month';
      };
      const range = parseRange(query);
      const items = await fetchSellerOrderItems(req.seller!.id, range);
      const periods = groupSalesByPeriod(items, query.groupBy);
      const totals = periods.reduce(
        (acc, p) => ({
          orderCount: acc.orderCount + p.orderCount,
          unitsSold: acc.unitsSold + p.unitsSold,
          revenue: acc.revenue + p.revenue,
        }),
        { orderCount: 0, unitsSold: 0, revenue: 0 },
      );

      ok(res, {
        range: {
          from: range.from?.toISOString() ?? null,
          to: range.to?.toISOString() ?? null,
        },
        groupBy: query.groupBy,
        totals: { ...totals, revenue: Math.round(totals.revenue * 100) / 100 },
        periods,
      });
    } catch (error) {
      next(error);
    }
  },
);

sellerAnalyticsRouter.get(
  '/products',
  validate({ query: topProductsQuerySchema }),
  async (req, res, next) => {
    try {
      const query = req.query as unknown as {
        from?: Date;
        to?: Date;
        limit: number;
      };
      const range = parseRange(query);
      const items = await fetchSellerOrderItems(req.seller!.id, range);
      const top = topProductsBySales(items, query.limit);

      ok(res, {
        range: {
          from: range.from?.toISOString() ?? null,
          to: range.to?.toISOString() ?? null,
        },
        items: top,
      });
    } catch (error) {
      next(error);
    }
  },
);

sellerAnalyticsRouter.get(
  '/geography',
  validate({ query: analyticsPeriodSchema }),
  async (req, res, next) => {
    try {
      const query = req.query as unknown as { from?: Date; to?: Date };
      const range = parseRange(query);
      const orders = await fetchSellerOrdersGeography(req.seller!.id, range);
      const regions = groupOrdersByGeography(orders);

      ok(res, {
        range: {
          from: range.from?.toISOString() ?? null,
          to: range.to?.toISOString() ?? null,
        },
        regions,
      });
    } catch (error) {
      next(error);
    }
  },
);

sellerAnalyticsRouter.get(
  '/revenue',
  validate({ query: analyticsPeriodSchema }),
  async (req, res, next) => {
    try {
      const query = req.query as unknown as {
        from?: Date;
        to?: Date;
        groupBy: 'day' | 'week' | 'month';
      };
      const range = parseRange(query);
      const items = await fetchSellerOrderItems(req.seller!.id, range);
      const periods = groupRevenueByPeriod(items, query.groupBy);
      const totalRevenue = periods.reduce((s, p) => s + p.revenue, 0);

      ok(res, {
        range: {
          from: range.from?.toISOString() ?? null,
          to: range.to?.toISOString() ?? null,
        },
        groupBy: query.groupBy,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        periods,
      });
    } catch (error) {
      next(error);
    }
  },
);
