import { z } from 'zod';

export const updateStoreSchema = z
  .object({
    name: z.string().min(2).max(120).optional(),
    description: z.string().max(5000).optional(),
    email: z.string().email().max(255).optional().nullable(),
    phone: z.string().min(5).max(30).optional().nullable(),
    address: z.string().max(500).optional().nullable(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });
