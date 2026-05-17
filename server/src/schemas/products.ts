import { z } from 'zod';
import { paginationQuerySchema, sortEnum } from './common.js';

export const productsQuerySchema = paginationQuerySchema.extend({
  categoryId: z.string().min(1).optional(),
  categorySlug: z.string().min(1).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  q: z.string().min(1).max(200).optional(),
  sort: sortEnum.default('newest'),
  attributes: z
    .record(z.string(), z.string())
    .optional()
    .describe('Фильтр по slug атрибута, напр. { "brand": "GoPhone" }'),
});
