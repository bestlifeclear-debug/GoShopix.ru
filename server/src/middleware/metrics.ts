import type { RequestHandler } from 'express';

interface RouteMetric {
  count: number;
  totalMs: number;
  errors: number;
}

const startedAt = Date.now();
const metrics = new Map<string, RouteMetric>();

function routeKey(method: string, path: string): string {
  return `${method} ${path}`;
}

function normalizePath(path: string): string {
  return path
    .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi, '/:id')
    .replace(/\/\d+/g, '/:id');
}

export const metricsMiddleware: RequestHandler = (req, res, next) => {
  if (req.path.startsWith('/api/health')) {
    next();
    return;
  }

  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const key = routeKey(req.method, normalizePath(req.path));
    const current = metrics.get(key) ?? { count: 0, totalMs: 0, errors: 0 };
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    current.count += 1;
    current.totalMs += durationMs;
    if (res.statusCode >= 500) current.errors += 1;
    metrics.set(key, current);
  });

  next();
};

export function getMetricsSnapshot() {
  const routes = [...metrics.entries()].map(([route, data]) => ({
    route,
    count: data.count,
    avgMs: data.count ? Math.round((data.totalMs / data.count) * 100) / 100 : 0,
    errors: data.errors,
  }));

  return {
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    routes: routes.sort((a, b) => b.count - a.count),
  };
}
