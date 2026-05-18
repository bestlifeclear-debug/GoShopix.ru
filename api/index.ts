import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Handler } from 'serverless-http';

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

let handlerPromise: Promise<Handler> | null = null;

async function getHandler(): Promise<Handler> {
  if (!handlerPromise) {
    handlerPromise = (async () => {
      const [{ default: serverless }, , { createApp }] = await Promise.all([
        import('serverless-http'),
        import('../server/dist/load-env.js'),
        import('../server/dist/app.js'),
      ]);
      return serverless(createApp());
    })();
  }
  return handlerPromise;
}

export default async function vercelHandler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<unknown> {
  normalizeRequestUrl(req);
  const handler = await getHandler();
  return handler(req, res);
}

export const config = {
  api: {
    externalResolver: true,
  },
};
