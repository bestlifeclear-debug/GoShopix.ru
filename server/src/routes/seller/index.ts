import { Router } from 'express';
import { sellerAnalyticsRouter } from './analytics.js';
import { sellerDashboardRouter } from './dashboard.js';
import { sellerOrdersRouter } from './orders.js';
import { sellerProductsRouter } from './products.js';
import { sellerStoreRouter } from './store.js';

export const sellerRouter = Router();

sellerRouter.use('/dashboard', sellerDashboardRouter);
sellerRouter.use('/products', sellerProductsRouter);
sellerRouter.use('/orders', sellerOrdersRouter);
sellerRouter.use('/analytics', sellerAnalyticsRouter);
sellerRouter.use('/store', sellerStoreRouter);
