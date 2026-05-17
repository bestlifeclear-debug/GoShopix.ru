import '../load-env.js';
import { resetConfigCache } from '../config/env.js';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-jwt-secret-min-32-chars!!';
process.env.JOBS_ENABLED = 'false';
process.env.LOG_LEVEL = 'error';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://goshopix:goshopix@127.0.0.1:5432/goshopix_test?schema=public';

resetConfigCache();
