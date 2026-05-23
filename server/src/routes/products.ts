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

const ELECTRONICS_FILTER_ATTRS = ['storage', 'screen-size'] as const;

async function categoryIdsForSlug(slug: string): Promise<string[]> {
  const cat = await prisma.category.findUnique({ where: { slug } });
  if (!cat) return [];
  const children = await prisma.category.findMany({
    where: { OR: [{ id: cat.id }, { parentId: cat.id }] },
    select: { id: true },
  });
  return children.map((c) => c.id);
}

async function resolveCategoryIds(
  categoryId?: string,
  categorySlug?: string,
  categorySlugs?: string[],
): Promise<string[] | undefined> {
  if (categoryId) {
    const children = await prisma.category.findMany({
      where: { OR: [{ id: categoryId }, { parentId: categoryId }] },
      select: { id: true },
    });
    return children.map((c) => c.id);
  }

  const slugs = [
    ...(categorySlugs ?? []),
    ...(categorySlug && !categorySlugs?.includes(categorySlug) ? [categorySlug] : []),
  ];
  if (slugs.length === 0) return undefined;

  const idSet = new Set<string>();
  for (const slug of slugs) {
    const ids = await categoryIdsForSlug(slug);
    for (const id of ids) idSet.add(id);
  }
  return [...idSet];
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

productsRouter.get('/facets', async (req, res, next) => {
  try {
    const categorySlug =
      typeof req.query.categorySlug === 'string' ? req.query.categorySlug : undefined;
    const categorySlugsRaw =
      typeof req.query.categorySlugs === 'string' ? req.query.categorySlugs : undefined;
    const categorySlugs = categorySlugsRaw
      ? categorySlugsRaw.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;
    const categoryIds = await resolveCategoryIds(undefined, categorySlug, categorySlugs);
    const where: Prisma.ProductWhereInput = { isPublished: true };
    if (categoryIds !== undefined) {
      if (categoryIds.length === 0) {
        ok(res, { brands: [], attributes: [] });
        return;
      }
      where.categoryId = { in: categoryIds };
    }

    const [brandRows, attrValueRows] = await Promise.all([
      prisma.product.findMany({
        where: { ...where, brand: { not: null } },
        select: { brand: true },
        distinct: ['brand'],
        orderBy: { brand: 'asc' },
      }),
      prisma.productAttributeValue.findMany({
        where: {
          product: where,
          attribute: { slug: { in: [...ELECTRONICS_FILTER_ATTRS] } },
        },
        select: {
          value: true,
          attribute: { select: { slug: true, name: true } },
        },
      }),
    ]);

    const attrMap = new Map<string, { slug: string; name: string; values: Set<string> }>();
    for (const row of attrValueRows) {
      const slug = row.attribute.slug;
      let entry = attrMap.get(slug);
      if (!entry) {
        entry = { slug, name: row.attribute.name, values: new Set() };
        attrMap.set(slug, entry);
      }
      entry.values.add(row.value);
    }

    ok(res, {
      brands: brandRows.map((r) => r.brand!).filter(Boolean),
      attributes: [...attrMap.values()].map((a) => ({
        slug: a.slug,
        name: a.name,
        values: [...a.values].sort((x, y) => x.localeCompare(y, 'ru')),
      })),
    });
  } catch (error) {
    next(error);
  }
});

productsRouter.get('/', validate({ query: productsQuerySchema }), async (req, res, next) => {
  try {
    const {
      page,
      limit,
      categoryId,
      categorySlug,
      categorySlugs: categorySlugsRaw,
      minPrice,
      maxPrice,
      q,
      sort,
      brand,
      brands,
      inStock,
    } = req.query as unknown as {
      page: number;
      limit: number;
      categoryId?: string;
      categorySlug?: string;
      categorySlugs?: string;
      minPrice?: number;
      maxPrice?: number;
      q?: string;
      sort:
        | 'newest'
        | 'popular'
        | 'price_asc'
        | 'price_desc'
        | 'name_asc'
        | 'rating_desc';
      brand?: string;
      brands?: string;
      inStock?: boolean;
    };

    const attributes = parseAttributesFromQuery(req.query as Record<string, unknown>);
    const pagination = parsePagination(page, limit);

    const where: Prisma.ProductWhereInput = { isPublished: true };

    const categorySlugsList = categorySlugsRaw
      ? categorySlugsRaw.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;
    const categoryIds = await resolveCategoryIds(categoryId, categorySlug, categorySlugsList);
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

    const brandList = [
      ...(brand ? [brand] : []),
      ...(brands ? brands.split(',').map((b) => b.trim()).filter(Boolean) : []),
    ];
    if (brandList.length > 0) {
      where.brand = brandList.length === 1 ? brandList[0] : { in: brandList };
    }

    if (inStock === true) {
      where.variants = { some: { stock: { gt: 0 } } };
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
            : sort === 'rating_desc'
              ? [{ rating: 'desc' }, { reviewCount: 'desc' }]
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
