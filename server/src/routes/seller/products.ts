import type { Prisma } from '@prisma/client';
import { Router } from 'express';
import { AppError } from '../../lib/errors.js';
import { assertValidSlug, slugify } from '../../lib/business-rules.js';
import { paginatedMeta, parsePagination, skipTake } from '../../lib/pagination.js';
import { prisma } from '../../lib/prisma.js';
import { ok } from '../../lib/response.js';
import {
  mapSellerProductDetail,
  mapSellerProductListItem,
  sellerProductDetailInclude,
  sellerProductListWithVariantsInclude,
} from '../../mappers/seller-product.js';
import { patchVariantSchema, variantIdParamSchema } from '../../schemas/seller/variant.js';
import { requireSeller } from '../../middleware/seller.js';
import { validate } from '../../middleware/validate.js';
import { idParamSchema } from '../../schemas/common.js';
import {
  createSellerProductSchema,
  type CreateSellerProductInput,
  sellerProductsQuerySchema,
  updateSellerProductSchema,
  uploadProductImagesSchema,
  type UploadProductImagesInput,
} from '../../schemas/seller/products.js';
import {
  assertProductOwnedBySeller,
  getPrimaryStore,
} from '../../services/seller.js';
import { paramString } from '../../utils/params.js';

export const sellerProductsRouter = Router();

sellerProductsRouter.use(...requireSeller);

sellerProductsRouter.get('/', validate({ query: sellerProductsQuerySchema }), async (req, res, next) => {
  try {
    const seller = req.seller!;
    const query = req.query as unknown as {
      page: number;
      limit: number;
      q?: string;
      isPublished?: boolean;
      categoryId?: string;
    };

    const pagination = parsePagination(query.page, query.limit);
    const where: Prisma.ProductWhereInput = { sellerId: seller.id };

    if (query.isPublished !== undefined) where.isPublished = query.isPublished;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { slug: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const [total, rows] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: sellerProductListWithVariantsInclude,
        orderBy: { updatedAt: 'desc' },
        ...skipTake(pagination),
      }),
    ]);

    ok(res, {
      items: rows.map(mapSellerProductListItem),
      meta: paginatedMeta(total, pagination),
    });
  } catch (error) {
    next(error);
  }
});

sellerProductsRouter.post('/', validate({ body: createSellerProductSchema }), async (req, res, next) => {
  try {
    const seller = req.seller!;
    const body = req.body as CreateSellerProductInput;

    const store =
      body.storeId != null
        ? seller.stores.find((s) => s.id === body.storeId)
        : getPrimaryStore(seller);

    if (!store) {
      throw new AppError(400, 'Store not found or does not belong to this seller');
    }

    const slug = body.slug ?? slugify(body.name);
    assertValidSlug(slug);

    const slugTaken = await prisma.product.findUnique({
      where: { storeId_slug: { storeId: store.id, slug } },
    });
    if (slugTaken) {
      throw new AppError(409, 'Product slug already exists in this store');
    }

    if (body.categoryId) {
      const cat = await prisma.category.findUnique({ where: { id: body.categoryId } });
      if (!cat) throw new AppError(400, 'Category not found');
    }

    const variants = body.variants ?? [
      {
        sku: `${slug}-default`.slice(0, 64),
        name: 'Стандарт',
        price: body.price,
        stock: 0,
        isDefault: true,
      },
    ];

    const hasDefault = variants.some((v) => v.isDefault);
    const variantCreates = variants.map((v, i) => ({
      sku: v.sku,
      name: v.name,
      price: v.price,
      stock: v.stock,
      isDefault: v.isDefault ?? (!hasDefault && i === 0),
      options: v.options?.length
        ? { create: v.options.map((o) => ({ name: o.name, value: o.value })) }
        : undefined,
    }));

    const skuExists = await prisma.productVariant.findFirst({
      where: { sku: { in: variants.map((v) => v.sku) } },
    });
    if (skuExists) {
      throw new AppError(409, `SKU already exists: ${skuExists.sku}`);
    }

    let attributeCreates: { attributeId: string; value: string }[] | undefined;
    if (body.attributes?.length) {
      const attrs = await prisma.productAttribute.findMany({
        where: { slug: { in: body.attributes.map((a) => a.attributeSlug) } },
      });
      if (attrs.length !== body.attributes.length) {
        throw new AppError(400, 'One or more attribute slugs are invalid');
      }
      const slugToId = new Map(attrs.map((a) => [a.slug, a.id]));
      attributeCreates = body.attributes.map((a) => ({
        attributeId: slugToId.get(a.attributeSlug)!,
        value: a.value,
      }));
    }

    const product = await prisma.product.create({
      data: {
        sellerId: seller.id,
        storeId: store.id,
        categoryId: body.categoryId ?? null,
        name: body.name,
        slug,
        description: body.description,
        price: body.price,
        isPublished: body.isPublished,
        variants: { create: variantCreates },
        attributes: attributeCreates ? { create: attributeCreates } : undefined,
      },
      include: sellerProductDetailInclude,
    });

    ok(res, mapSellerProductDetail(product), 201);
  } catch (error) {
    next(error);
  }
});

sellerProductsRouter.get('/:id', validate({ params: idParamSchema }), async (req, res, next) => {
  try {
    const productId = paramString(req.params.id);
    await assertProductOwnedBySeller(productId, req.seller!.id);

    const product = await prisma.product.findUniqueOrThrow({
      where: { id: productId },
      include: sellerProductDetailInclude,
    });

    ok(res, mapSellerProductDetail(product));
  } catch (error) {
    next(error);
  }
});

sellerProductsRouter.put(
  '/:id',
  validate({ params: idParamSchema, body: updateSellerProductSchema }),
  async (req, res, next) => {
    try {
      const productId = paramString(req.params.id);
      const existing = await assertProductOwnedBySeller(productId, req.seller!.id);
      const body = req.body;

      if (body.slug && body.slug !== existing.slug) {
        assertValidSlug(body.slug);
        const taken = await prisma.product.findFirst({
          where: {
            storeId: existing.storeId,
            slug: body.slug,
            id: { not: productId },
          },
        });
        if (taken) throw new AppError(409, 'Product slug already exists in this store');
      }

      if (body.categoryId) {
        const cat = await prisma.category.findUnique({ where: { id: body.categoryId } });
        if (!cat) throw new AppError(400, 'Category not found');
      }

      const product = await prisma.product.update({
        where: { id: productId },
        data: {
          name: body.name,
          slug: body.slug,
          description: body.description,
          price: body.price,
          isPublished: body.isPublished,
          categoryId: body.categoryId,
        },
        include: sellerProductDetailInclude,
      });

      ok(res, mapSellerProductDetail(product));
    } catch (error) {
      next(error);
    }
  },
);

sellerProductsRouter.delete(
  '/:id',
  validate({ params: idParamSchema }),
  async (req, res, next) => {
    try {
      const productId = paramString(req.params.id);
      await assertProductOwnedBySeller(productId, req.seller!.id);

      await prisma.product.delete({ where: { id: productId } });

      ok(res, { deleted: true, id: productId });
    } catch (error) {
      next(error);
    }
  },
);

sellerProductsRouter.post(
  '/:id/images',
  validate({ params: idParamSchema, body: uploadProductImagesSchema }),
  async (req, res, next) => {
    try {
      const productId = paramString(req.params.id);
      await assertProductOwnedBySeller(productId, req.seller!.id);
      const { images } = req.body as UploadProductImagesInput;

      for (const img of images) {
        if (img.variantId) {
          const variant = await prisma.productVariant.findFirst({
            where: { id: img.variantId, productId },
          });
          if (!variant) {
            throw new AppError(400, `Variant ${img.variantId} not found for this product`);
          }
        }
      }

      const hasPrimary = images.some((i) => i.isPrimary);
      if (hasPrimary) {
        await prisma.productImage.updateMany({
          where: { productId },
          data: { isPrimary: false },
        });
      }

      const created = await prisma.$transaction(
        images.map((img) =>
          prisma.productImage.create({
            data: {
              productId,
              variantId: img.variantId ?? null,
              url: img.url,
              alt: img.alt,
              sortOrder: img.sortOrder ?? 0,
              isPrimary: img.isPrimary ?? false,
            },
          }),
        ),
      );

      ok(res, { images: created }, 201);
    } catch (error) {
      next(error);
    }
  },
);

sellerProductsRouter.patch(
  '/variants/:variantId',
  validate({ params: variantIdParamSchema, body: patchVariantSchema }),
  async (req, res, next) => {
    try {
      const variantId = paramString(req.params.variantId);
      const sellerId = req.seller!.id;
      const body = req.body as { price?: number; stock?: number };

      const variant = await prisma.productVariant.findFirst({
        where: { id: variantId, product: { sellerId } },
        include: { product: { select: { id: true, name: true } } },
      });
      if (!variant) throw new AppError(404, 'Variant not found');

      const updated = await prisma.productVariant.update({
        where: { id: variantId },
        data: {
          ...(body.price !== undefined ? { price: body.price } : {}),
          ...(body.stock !== undefined ? { stock: body.stock } : {}),
        },
      });

      ok(res, {
        id: updated.id,
        productId: variant.product.id,
        productName: variant.product.name,
        sku: updated.sku,
        name: updated.name,
        price: updated.price.toNumber(),
        stock: updated.stock,
        isDefault: updated.isDefault,
      });
    } catch (error) {
      next(error);
    }
  },
);
