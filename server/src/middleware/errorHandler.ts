import type { ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { checkEnv, formatEnvSetupHint } from '../config/env.js';
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

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    logger.error('Database error', { code: err.code, meta: err.meta, path: req.originalUrl });
    const hint =
      err.code === 'P2022' || String(err.message).includes('does not exist')
        ? 'Схема БД устарела: выполните npm run db:migrate:deploy -w server'
        : 'Database error';
    fail(res, 500, hint, err.code);
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
    const check = checkEnv();
    fail(
      res,
      503,
      check.missing.length > 0 ? formatEnvSetupHint(check.missing) : 'Server configuration error',
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
