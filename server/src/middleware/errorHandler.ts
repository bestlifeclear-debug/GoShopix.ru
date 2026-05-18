import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError, isAppError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';
import { captureException } from '../lib/sentry.js';
import { fail } from '../lib/response.js';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof ZodError) {
    fail(res, 400, 'Validation failed', err.flatten());
    return;
  }

  if (isAppError(err)) {
    if (err.statusCode >= 500) {
      logger.error('Application error', {
        message: err.message,
        code: err.code,
        path: req.originalUrl,
      });
      captureException(err, { path: req.originalUrl, method: req.method });
    }
    fail(res, err.statusCode, err.message, err.code);
    return;
  }

  const message = err instanceof Error ? err.message : String(err);

  if (message.startsWith('Invalid environment configuration')) {
    logger.error('Invalid environment configuration', { message, path: req.originalUrl });
    fail(
      res,
      503,
      process.env.VERCEL === '1'
        ? 'Сервер не настроен: проверьте DATABASE_URL и JWT_SECRET (≥16 символов) в Vercel'
        : 'Server configuration error',
    );
    return;
  }

  logger.error('Unhandled error', {
    path: req.originalUrl,
    method: req.method,
    error: message,
  });
  captureException(err, { path: req.originalUrl, method: req.method });
  fail(res, 500, 'Internal server error');
};
