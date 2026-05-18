import type { RequestHandler } from 'express';
import { isAllowedRequestOrigin } from '../lib/allowed-origins.js';
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

  const origin = req.get('origin') ?? req.get('referer') ?? undefined;
  if (!origin) {
    if (config.isDevelopment || process.env.VERCEL) {
      next();
      return;
    }
    fail(res, 403, 'Origin header required');
    return;
  }

  if (!isAllowedRequestOrigin(origin.split('?')[0]!)) {
    fail(res, 403, 'Invalid request origin');
    return;
  }

  next();
};
