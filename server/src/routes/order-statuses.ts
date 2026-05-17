import { Router } from 'express';
import { ORDER_STATUS_DEFINITIONS } from '@goshopix/shared';
import { ok } from '../lib/response.js';

export const orderStatusesRouter = Router();

orderStatusesRouter.get('/', (_req, res) => {
  ok(res, { items: ORDER_STATUS_DEFINITIONS });
});
