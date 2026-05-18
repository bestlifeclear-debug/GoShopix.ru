import cors from 'cors';
import express from 'express';
import { errorHandler } from './middleware/errorHandler.js';
import { categoriesRouter } from './routes/categories.js';
import { productsRouter } from './routes/products.js';
import { isAllowedRequestOrigin } from './lib/allowed-origins.js';

/** Catalog API only — smaller cold start on Vercel than full createApp(). */
export function createCatalogApp() {
  const app = express();

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
  app.use('/api/categories', categoriesRouter);
  app.use('/api/products', productsRouter);
  app.use(errorHandler);

  return app;
}
