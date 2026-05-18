import type { VercelResponse } from '@vercel/node';
import '../../server/dist/load-env.js';
import { loadConfig } from '../../server/dist/config/env.js';

/** Validates env before loading Express; returns false if response already sent. */
export function ensureEnvOrRespond(res: VercelResponse): boolean {
  try {
    loadConfig();
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid environment configuration';
    res.status(503).json({
      success: false,
      error:
        process.env.VERCEL === '1'
          ? 'Сервер не настроен: добавьте DATABASE_URL и JWT_SECRET (минимум 16 символов) в Vercel → Environment Variables'
          : message,
    });
    return false;
  }
}
