import { Router } from 'express';
import { ok } from '../lib/response.js';

export const cityDetectRouter = Router();

cityDetectRouter.get('/', async (req, res) => {
  const xf = req.headers['x-forwarded-for'];
  const raw =
    typeof xf === 'string'
      ? xf.split(',')[0]?.trim()
      : (req.socket.remoteAddress ?? '').replace(/^::ffff:/, '');
  const ip = raw.replace(/^::ffff:/, '');

  if (!ip || ip === '127.0.0.1' || ip === '::1') {
    return ok(res, { city: null as string | null });
  }

  try {
    const r = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,city&lang=ru`,
      { signal: AbortSignal.timeout(5000) },
    );
    const j = (await r.json()) as { status?: string; city?: string };
    if (j.status !== 'success' || !j.city?.trim()) {
      return ok(res, { city: null as string | null });
    }
    return ok(res, { city: j.city.trim() });
  } catch {
    return ok(res, { city: null as string | null });
  }
});
