import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { loadConfig } from './config/env.js';
import { fail } from './lib/response.js';
import { errorHandler } from './middleware/errorHandler.js';
import { metricsMiddleware } from './middleware/metrics.js';
import { auditLog } from './middleware/auditLog.js';
import { csrfOriginGuard } from './middleware/csrfOrigin.js';
import { requestLogger } from './middleware/requestLogger.js';
import { openApiSpec } from './openapi/spec.js';
import { authRouter } from './routes/auth.js';
import { cartRouter } from './routes/cart.js';
import { categoriesRouter } from './routes/categories.js';
import { cityDetectRouter } from './routes/city-detect.js';
import { favoritesRouter } from './routes/favorites.js';
import { healthRouter } from './routes/health.js';
import { ordersRouter } from './routes/orders.js';
import { productsRouter } from './routes/products.js';
import { sellerRouter } from './routes/seller/index.js';
import { orderStatusesRouter } from './routes/order-statuses.js';
import { notificationsRouter } from './routes/notifications.js';
import { webhooksRouter } from './routes/webhooks.js';
import { isAllowedRequestOrigin } from './lib/allowed-origins.js';

export function createApp() {
  const app = express();
  const config = loadConfig();

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || isAllowedRequestOrigin(origin)) {
          callback(null, true);
          return;
        }
        callback(null, false);
      },
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(requestLogger);
  app.use(csrfOriginGuard);
  app.use(auditLog);
  app.use(metricsMiddleware);

  const apiBase =
    config.API_PUBLIC_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://127.0.0.1:${config.PORT}`);

  const apiSpec = {
    ...openApiSpec,
    servers: [
      {
        url: apiBase,
        description: config.NODE_ENV,
      },
    ],
  };

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(apiSpec, { explorer: true }));
  app.get('/api/docs/openapi.json', (_req, res) => {
    res.json(apiSpec);
  });

  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/city-detect', cityDetectRouter);
  app.use('/api/cart', cartRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/favorites', favoritesRouter);
  app.use('/api/order-statuses', orderStatusesRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/webhooks', webhooksRouter);
  app.use('/api/seller', sellerRouter);

  app.use((_req, res) => {
    fail(res, 404, 'Not found');
  });

  app.use(errorHandler);

  return app;
}
