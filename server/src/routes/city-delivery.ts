import type { Request, Response, NextFunction } from 'express';
import { ok } from '../lib/response.js';
import { filterCitySuggestions, runCityDeliveryCheck } from '../lib/city-delivery-check.js';
import { validate } from '../middleware/validate.js';
import { citySuggestionsQuerySchema, checkCityDeliveryBodySchema } from '../schemas/city-delivery.js';

export async function getCitySuggestions(req: Request, res: Response, next: NextFunction) {
  try {
    const { q } = req.query as { q: string };
    const suggestions = filterCitySuggestions(q, 15);
    return ok(res, { suggestions });
  } catch (e) {
    next(e);
  }
}

export async function postCheckCityDelivery(req: Request, res: Response, next: NextFunction) {
  try {
    const { city, index } = req.body as { city: string; index?: string };
    const result = await runCityDeliveryCheck(city, index);
    return ok(res, result);
  } catch (e) {
    next(e);
  }
}

export async function getCityDetect(req: Request, res: Response, next: NextFunction) {
  try {
    const xf = req.headers['x-forwarded-for'];
    const raw =
      typeof xf === 'string'
        ? xf.split(',')[0]?.trim()
        : (req.socket.remoteAddress ?? '').replace(/^::ffff:/, '');
    const ip = raw.replace(/^::ffff:/, '');
    if (!ip || ip === '127.0.0.1' || ip === '::1') {
      return ok(res, { city: null as string | null });
    }
    const r = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,city&lang=ru`,
      { signal: AbortSignal.timeout(5000) },
    );
    const j = (await r.json()) as { status?: string; city?: string };
    if (j.status !== 'success' || !j.city) {
      return ok(res, { city: null as string | null });
    }
    return ok(res, { city: j.city });
  } catch {
    return ok(res, { city: null as string | null });
  }
}

export const citySuggestionsHandlers = [validate({ query: citySuggestionsQuerySchema }), getCitySuggestions];

export const checkCityDeliveryHandlers = [validate({ body: checkCityDeliveryBodySchema }), postCheckCityDelivery];
