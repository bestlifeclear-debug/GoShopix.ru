import { Router } from 'express';
import { ok } from '../lib/response.js';
import { detectCityFromRequest } from '../services/city-detect.js';

export const cityDetectRouter = Router();

/**
 * GET /api/city-detect
 * Определяет город пользователя по IP (для города доставки в шапке).
 */
cityDetectRouter.get('/', async (req, res) => {
  const result = await detectCityFromRequest(req);
  return ok(res, { city: result.city });
});
