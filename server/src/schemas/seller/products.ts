import { z } from 'zod';
import { PRICE_MAX, PRICE_MIN, STOCK_MAX, STOCK_MIN } from '../../lib/business-rules.js';
import { paginationQuerySchema } from '../common.js';

const priceSchema = z.coerce.number().min(PRICE_MIN).max(PRICE_MAX);
const stockSchema = z.coerce.number().int().min(STOCK_MIN).max(STOCK_MAX);

const variantOptionSchema = z.object({
  name: z.string().min(1).max(50),
  value: z.string().min(1).max(100),
});

const variantInputSchema = z.object({
  sku: z.string().min(1).max(64),
  name: z.string().max(120).optional(),
  price: priceSchema,
  stock: stockSchema.default(0),
  isDefault: z.boolean().optional(),
  options: z.array(variantOptionSchema).max(10).optional(),
});

const attributeInputSchema = z.object({
  attributeSlug: z.string().min(1).max(50),
  value: z.string().min(1).max(200),
});

export const sellerProductsQuerySchema = paginationQuerySchema.extend({
  q: z.string().max(200).optional(),
  isPublished: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  categoryId: z.string().min(1).optional(),
});

export const createSellerProductSchema = z
  .object({
    storeId: z.string().min(1).optional(),
    categoryId: z.string().min(1).optional().nullable(),
    name: z.string().min(2).max(200),
    slug: z.string().min(2).max(100).optional(),
    description: z.string().max(5000).default(''),
    price: priceSchema,
    isPublished: z.boolean().default(false),
    variants: z.array(variantInputSchema).min(1).max(50).optional(),
    attributes: z.array(attributeInputSchema).max(20).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.variants) {
      const skus = data.variants.map((v) => v.sku);
      if (new Set(skus).size !== skus.length) {
        ctx.addIssue({ code: 'custom', message: 'Variant SKUs must be unique', path: ['variants'] });
      }
      const defaults = data.variants.filter((v) => v.isDefault);
      if (defaults.length > 1) {
        ctx.addIssue({ code: 'custom', message: 'Only one default variant allowed', path: ['variants'] });
      }
    }
  });

export const updateSellerProductSchema = z
  .object({
    categoryId: z.string().min(1).optional().nullable(),
    name: z.string().min(2).max(200).optional(),
    slug: z.string().min(2).max(100).optional(),
    description: z.string().max(5000).optional(),
    price: priceSchema.optional(),
    isPublished: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const uploadProductImagesSchema = z.object({
  images: z
    .array(
      z.object({
        url: z.string().url().max(2000),
        alt: z.string().max(200).optional(),
        isPrimary: z.boolean().optional(),
        sortOrder: z.coerce.number().int().min(0).max(100).optional(),
        variantId: z.string().min(1).optional(),
      }),
    )
    .min(1)
    .max(20),
});

export type CreateSellerProductInput = z.infer<typeof createSellerProductSchema>;
export type UpdateSellerProductInput = z.infer<typeof updateSellerProductSchema>;
export type UploadProductImagesInput = z.infer<typeof uploadProductImagesSchema>;
