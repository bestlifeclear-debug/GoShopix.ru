import * as Sentry from '@sentry/node';
import type { AppConfig } from '../config/env.js';
import { logger } from './logger.js';

let initialized = false;

export function initSentry(config: AppConfig): void {
  if (!config.SENTRY_DSN || initialized) return;

  Sentry.init({
    dsn: config.SENTRY_DSN,
    environment: config.SENTRY_ENVIRONMENT ?? config.NODE_ENV,
    tracesSampleRate: config.SENTRY_TRACES_SAMPLE_RATE,
    enabled: !config.isTest,
  });
  initialized = true;
  logger.info('Sentry initialized', { environment: config.SENTRY_ENVIRONMENT ?? config.NODE_ENV });
}

export function captureException(error: unknown, context?: Record<string, unknown>): void {
  if (!initialized) return;
  Sentry.withScope((scope) => {
    if (context) scope.setContext('extra', context);
    Sentry.captureException(error);
  });
}
