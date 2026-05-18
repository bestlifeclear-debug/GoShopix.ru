import type { VercelRequest, VercelResponse } from '@vercel/node';
import serverless from 'serverless-http';
import '../server/dist/load-env.js';
import { createApp } from '../server/dist/app.js';

const app = createApp();
const handler = serverless(app);

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

export default async function vercelHandler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<unknown> {
  normalizeRequestUrl(req);
  return handler(req, res);
}

export const config = {
  api: {
    externalResolver: true,
  },
};
