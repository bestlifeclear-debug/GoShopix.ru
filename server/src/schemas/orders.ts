import { z } from 'zod';
import { idParamSchema, paginationQuerySchema } from './common.js';

export const createOrderSchema = z.object({
  shippingName: z.string().min(1).max(200),
  shippingPhone: z.string().min(5).max(30),
  shippingAddress: z.string().min(5).max(500),
  paymentMethod: z.enum(['card', 'cash', 'sbp']).optional(),
});

export const ordersQuerySchema = paginationQuerySchema;

export const orderParamsSchema = idParamSchema;

export const paymentRedirectSchema = z.object({
  paymentMethod: z.enum(['card', 'sbp']),
  returnUrl: z.string().min(1).max(500).optional(),
});
