import { z } from 'zod';

export const citySuggestionsQuerySchema = z.object({
  q: z.string().min(3).max(100),
});

export const checkCityDeliveryBodySchema = z.object({
  city: z.string().min(1).max(200),
  index: z.string().max(10).optional(),
});
