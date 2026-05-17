import { z } from 'zod';
import { PRICE_MAX, PRICE_MIN, STOCK_MAX, STOCK_MIN } from '../../lib/business-rules.js';

export const variantIdParamSchema = z.object({
  variantId: z.string().min(1),
});

export const patchVariantSchema = z
  .object({
    price: z.coerce.number().min(PRICE_MIN).max(PRICE_MAX).optional(),
    stock: z.coerce.number().int().min(STOCK_MIN).max(STOCK_MAX).optional(),
  })
  .refine((d) => d.price !== undefined || d.stock !== undefined, {
    message: 'Укажите price или stock',
  });
