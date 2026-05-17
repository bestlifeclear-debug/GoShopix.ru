import './load-env.js';
import { createApp } from './app.js';
import { loadConfig } from './config/env.js';
import { logger } from './lib/logger.js';
import { prisma } from './lib/prisma.js';
import { initSentry } from './lib/sentry.js';
import { startJobWorker, stopJobWorker } from './workers/job-processor.js';

const config = loadConfig();
initSentry(config);

const app = createApp();

const server = app.listen(config.PORT, () => {
  logger.info('GoShopix API started', {
    port: config.PORT,
    environment: config.NODE_ENV,
    docs: `http://127.0.0.1:${config.PORT}/api/docs`,
  });
  if (config.JOBS_ENABLED) {
    startJobWorker();
  }
});

async function shutdown() {
  if (config.JOBS_ENABLED) {
    stopJobWorker();
  }
  await prisma.$disconnect();
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
