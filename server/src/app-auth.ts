import cors from 'cors';
import express from 'express';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './routes/auth.js';
import { isAllowedRequestOrigin } from './lib/allowed-origins.js';

/** Minimal Express app for /api/auth/* on Vercel (faster cold start than full createApp). */
export function createAuthApp() {
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || isAllowedRequestOrigin(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use('/api/auth', authRouter);
  app.use(errorHandler);

  return app;
}
