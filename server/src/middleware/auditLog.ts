import type { RequestHandler } from 'express';
import { logger } from '../lib/logger.js';

const AUDIT_PATHS = [
  /^\/api\/auth\/(login|login-phone|register|check-phone|forgot-password|reset-password)/,
  /^\/api\/orders/,
  /^\/api\/seller\/orders/,
];

export const auditLog: RequestHandler = (req, res, next) => {
  const shouldAudit = AUDIT_PATHS.some((re) => re.test(req.path));
  if (!shouldAudit) {
    next();
    return;
  }

  res.on('finish', () => {
    logger.info('Audit', {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      userId: req.user?.sub,
      ip: req.ip,
    });
  });

  next();
};
