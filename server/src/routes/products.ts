import type { Prisma } from '@prisma/client';
import { Router } from 'express';
import { AppError } from '../lib/errors.js';
import { paginatedMeta, parsePagination, skipTake } from '../lib/pagination.js';
import { prisma } from '../lib/prisma.js';
import { ok } from '../lib/response.js';
import {
  mapProductDetail,
  mapProductLegacy,
  mapProductListItem,
  productDetailInclude,
  productListInclude,
} from '../mappers/product.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../schemas/common.js';
import { productsQuerySchema } from '../schemas/products.js';
import { paramString } from '../utils/params.js';
import { parseAttributesFromQuery } from '../utils/query.js';

export const productsRouter = Router();

async function resolveCategoryIds(
  categoryId?: string,
  categorySlug?: string,
): Promise<string[] | undefined> {
  if (categoryId) {
    const children = await prisma.category.findMany({
      where: { OR: [{ id: categoryId }, { parentId: categoryId }] },
      select: { id: true },
    });
    return children.map((c) => c.id);
  }

  if (categorySlug) {
    const cat = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (!cat) return [];
    const children = await prisma.category.findMany({
      where: { OR: [{ id: cat.id }, { parentId: cat.id }] },
      select: { id: true },
    });
    return children.map((c) => c.id);
  }

  return undefined;
}

async function productIdsMatchingAttributes(
  attributes: Record<string, string>,
): Promise<string[] | undefined> {
  const slugs = Object.keys(attributes);
  if (slugs.length === 0) return undefined;

  const attrRows = await prisma.productAttribute.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true },
  });

  if (attrRows.length !== slugs.length) {
    return [];
  }

  const slugToId = new Map(attrRows.map((a) => [a.slug, a.id]));

  let candidateIds: string[] | null = null;

  for (const [slug, value] of Object.entries(attributes)) {
    const attributeId = slugToId.get(slug)!;
    const matches = await prisma.productAttributeValue.findMany({
      where: { attributeId, value: { equals: value, mode: 'insensitive' } },
      select: { productId: true },
    });
    const ids = new Set(matches.map((m) => m.productId));
    if (candidateIds === null) {
      candidateIds = [...ids];
    } else {
      candidateIds = candidateIds.filter((id) => ids.has(id));
    }
    if (candidateIds.length === 0) return [];
  }

  return candidateIds ?? undefined;
}

productsRouter.get('/', validate({ query: productsQuerySchema }), async (req, res, next) => {
  try {
    const {
      page,
      limit,
      categoryId,
      categorySlug,
      minPrice,
      maxPrice,
      q,
      sort,
    } = req.query as unknown as {
      page: number;
      limit: number;
      categoryId?: string;
      categorySlug?: string;
      minPrice?: number;
      maxPrice?: number;
      q?: string;
      sort: 'newest' | 'popular' | 'price_asc' | 'price_desc' | 'name_asc';
    };

    const attributes = parseAttributesFromQuery(req.query as Record<string, unknown>);
    const pagination = parsePagination(page, limit);

    const where: Prisma.ProductWhereInput = { isPublished: true };

    const categoryIds = await resolveCategoryIds(categoryId, categorySlug);
    if (categoryIds !== undefined) {
      if (categoryIds.length === 0) {
        ok(res, { items: [], meta: paginatedMeta(0, pagination) });
        return;
      }
      where.categoryId = { in: categoryIds };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (attributes) {
      const attrProductIds = await productIdsMatchingAttributes(attributes);
      if (attrProductIds !== undefined) {
        if (attrProductIds.length === 0) {
          ok(res, { items: [], meta: paginatedMeta(0, pagination) });
          return;
        }
        where.id = { in: attrProductIds };
      }
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput[] | Prisma.ProductOrderByWithRelationInput =
      sort === 'price_asc'
        ? { price: 'asc' }
        : sort === 'price_desc'
          ? { price: 'desc' }
          : sort === 'name_asc'
            ? { name: 'asc' }
            : sort === 'popular'
              ? [{ reviewCount: 'desc' }, { rating: 'desc' }]
              : { createdAt: 'desc' };

    const [total, rows] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: productListInclude,
        orderBy,
        ...skipTake(pagination),
      }),
    ]);

    ok(res, {
      items: rows.map(mapProductListItem),
      products: rows.map(mapProductLegacy),
      meta: paginatedMeta(total, pagination),
    });
  } catch (error) {
    next(error);
  }
});

productsRouter.get('/:id', validate({ params: idParamSchema }), async (req, res, next) => {
  try {
    const productId = paramString(req.params.id);
    const product = await prisma.product.findFirst({
      where: { id: productId, isPublished: true },
      include: productDetailInclude,
    });

    if (!product) {
      throw new AppError(404, 'Product not found');
    }

    ok(res, mapProductDetail(product));
  } catch (error) {
    next(error);
  }
});
