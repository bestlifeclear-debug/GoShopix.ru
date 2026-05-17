import type { HealthCheck, ReadinessCheck } from '@goshopix/shared';
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { getMetricsSnapshot } from '../middleware/metrics.js';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  const payload: HealthCheck = {
    status: 'ok',
    service: 'goshopix-api',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? 'development',
  };
  res.json({ success: true, data: payload });
});

healthRouter.get('/live', (_req, res) => {
  res.json({
    success: true,
    data: { status: 'ok', timestamp: new Date().toISOString() },
  });
});

healthRouter.get('/ready', async (_req, res) => {
  let database: 'ok' | 'error' = 'ok';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = 'error';
  }

  const payload: ReadinessCheck = {
    status: database === 'ok' ? 'ok' : 'degraded',
    service: 'goshopix-api',
    timestamp: new Date().toISOString(),
    checks: { database },
  };

  const statusCode = database === 'ok' ? 200 : 503;
  res.status(statusCode).json({ success: database === 'ok', data: payload });
});

healthRouter.get('/metrics', (_req, res) => {
  res.json({ success: true, data: getMetricsSnapshot() });
});
