import type { RequestHandler } from 'express';
import { loadConfig } from '../config/env.js';
import { fail } from '../lib/response.js';

/**
 * Для SPA с JWT: проверяем Origin/Referer на мутациях (защита от CSRF с чужих сайтов).
 */
export const csrfOriginGuard: RequestHandler = (req, res, next) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    next();
    return;
  }

  const config = loadConfig();
  if (config.isTest) {
    next();
    return;
  }

  const origin = req.get('origin') ?? req.get('referer');
  if (!origin) {
    // curl / server-to-server без Origin — пропускаем в dev
    if (config.isDevelopment) {
      next();
      return;
    }
    fail(res, 403, 'Origin header required');
    return;
  }

  const allowed = [
    config.CORS_ORIGIN,
    'http://127.0.0.1:5173',
    'http://localhost:5173',
    'http://127.0.0.1:8080',
  ].filter(Boolean) as string[];

  const ok = allowed.some((base) => origin.startsWith(base));
  if (!ok) {
    fail(res, 403, 'Invalid request origin');
    return;
  }

  next();
};
