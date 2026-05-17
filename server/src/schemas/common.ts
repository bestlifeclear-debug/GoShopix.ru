import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.string().min(1),
});

export const productIdParamSchema = z.object({
  productId: z.string().min(1),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const sortEnum = z.enum(['newest', 'popular', 'price_asc', 'price_desc', 'name_asc']);
