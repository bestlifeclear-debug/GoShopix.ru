import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Express } from 'express';
import { ensureEnvOrRespond } from './_shared/ensure-env.js';
import { runExpress } from './_shared/run-express.js';

/**
 * Vercel (non-Next) does not support api/[...path].ts catch-all routes.
 * vercel.json rewrites /api/:path* → /api; subpath may arrive in req.query.path.
 */
function normalizeRequestUrl(req: VercelRequest): void {
  const raw = req.query.path;
  if (raw == null) return;

  const subpath = Array.isArray(raw) ? raw.join('/') : String(raw);
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(req.query)) {
    if (key === 'path') continue;
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const v of value) params.append(key, v);
    } else {
      params.append(key, value);
    }
  }
  const qs = params.toString();
  req.url = `/api/${subpath}${qs ? `?${qs}` : ''}`;
  delete req.query.path;
}

let appPromise: Promise<Express> | null = null;

async function getApp(): Promise<Express> {
  if (!appPromise) {
    appPromise = (async () => {
      await import('../server/dist/load-env.js');
      const { createApp } = await import('../server/dist/app.js');
      return createApp();
    })();
  }
  return appPromise;
}

export default async function vercelHandler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (!ensureEnvOrRespond(res)) return;
  normalizeRequestUrl(req);
  const app = await getApp();
  await runExpress(app, req, res);
}
