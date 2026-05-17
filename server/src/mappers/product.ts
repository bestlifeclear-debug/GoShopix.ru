import type { Prisma } from '@prisma/client';

const listInclude = {
  images: { orderBy: { sortOrder: 'asc' as const }, take: 6 },
  category: { select: { id: true, name: true, slug: true } },
  store: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.ProductInclude;

const detailInclude = {
  images: { orderBy: { sortOrder: 'asc' as const } },
  category: { select: { id: true, name: true, slug: true, parentId: true } },
  store: { select: { id: true, name: true, slug: true } },
  attributes: {
    include: { attribute: { select: { id: true, name: true, slug: true, type: true } } },
  },
  variants: {
    include: {
      options: true,
      images: { orderBy: { sortOrder: 'asc' as const } },
    },
    orderBy: { isDefault: 'desc' as const },
  },
} satisfies Prisma.ProductInclude;

export { listInclude as productListInclude, detailInclude as productDetailInclude };

type ListRow = Prisma.ProductGetPayload<{ include: typeof listInclude }>;
type DetailRow = Prisma.ProductGetPayload<{ include: typeof detailInclude }>;

function decimal(n: { toNumber: () => number }): number {
  return n.toNumber();
}

function discountPercent(price: number, compareAt: number | null): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round((1 - price / compareAt) * 100);
}

export function mapProductListItem(row: ListRow) {
  const price = decimal(row.price);
  const compareAtPrice = row.compareAtPrice ? decimal(row.compareAtPrice) : null;
  const images = row.images.map((img) => ({
    id: img.id,
    url: img.url,
    alt: img.alt,
  }));

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price,
    compareAtPrice,
    discountPercent: discountPercent(price, compareAtPrice),
    brand: row.brand,
    rating: decimal(row.rating),
    reviewCount: row.reviewCount,
    promoBadge: row.promoBadge,
    imageUrl: images[0]?.url ?? null,
    images,
    category: row.category,
    store: row.store,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapProductDetail(row: DetailRow) {
  const price = decimal(row.price);
  const compareAtPrice = row.compareAtPrice ? decimal(row.compareAtPrice) : null;
  const gallery = row.images.map((img) => ({
    id: img.id,
    url: img.url,
    alt: img.alt,
    isPrimary: img.isPrimary,
    sortOrder: img.sortOrder,
  }));

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price,
    compareAtPrice,
    discountPercent: discountPercent(price, compareAtPrice),
    brand: row.brand,
    rating: decimal(row.rating),
    reviewCount: row.reviewCount,
    promoBadge: row.promoBadge,
    deliveryDaysMin: row.deliveryDaysMin,
    deliveryDaysMax: row.deliveryDaysMax,
    imageUrl: gallery[0]?.url ?? null,
    images: gallery,
    isPublished: row.isPublished,
    category: row.category,
    store: row.store,
    attributes: row.attributes.map((a) => ({
      slug: a.attribute.slug,
      name: a.attribute.name,
      value: a.value,
    })),
    variants: row.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      name: v.name,
      price: decimal(v.price),
      stock: v.stock,
      isDefault: v.isDefault,
      options: v.options,
      images: v.images,
    })),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Для обратной совместимости с shared Product (title) */
export function mapProductLegacy(row: ListRow) {
  const item = mapProductListItem(row);
  return {
    id: item.id,
    title: item.name,
    description: item.description,
    price: item.price,
    imageUrl: item.imageUrl,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}
