import { OrderStatus } from '@prisma/client';
import { z } from 'zod';
import { paginationQuerySchema, idParamSchema } from '../common.js';

export const sellerOrdersQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(OrderStatus).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  note: z.string().max(500).optional(),
});

export { idParamSchema as sellerOrderParamsSchema };
