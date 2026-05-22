import { z } from 'zod';
import { idParamSchema } from './common.js';

export const addCartItemSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.coerce.number().int().positive().max(99).default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().positive().max(99),
});

export const cartItemParamsSchema = idParamSchema;

export const mergeCartSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.coerce.number().int().positive().max(99),
      }),
    )
    .max(100),
});
