import type { Prisma } from '@prisma/client';
import { mapProductDetail, productDetailInclude, productListInclude } from './product.js';

export { productDetailInclude as sellerProductDetailInclude, productListInclude as sellerProductListInclude };

const listIncludeWithVariants = {
  ...productListInclude,
  variants: { select: { id: true, sku: true, name: true, price: true, stock: true, isDefault: true } },
} satisfies Prisma.ProductInclude;

export { listIncludeWithVariants as sellerProductListWithVariantsInclude };

type ListRow = Prisma.ProductGetPayload<{ include: typeof listIncludeWithVariants }>;

export function mapSellerProductListItem(row: ListRow) {
  const totalStock = row.variants.reduce((s, v) => s + v.stock, 0);
  const defaultVariant = row.variants.find((v) => v.isDefault) ?? row.variants[0];
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: defaultVariant?.price.toNumber() ?? row.price.toNumber(),
    isPublished: row.isPublished,
    imageUrl: row.images[0]?.url ?? null,
    category: row.category,
    store: row.store,
    totalStock,
    variantCount: row.variants.length,
    variants: row.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      name: v.name,
      price: v.price.toNumber(),
      stock: v.stock,
      isDefault: v.isDefault,
    })),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapSellerProductDetail(row: Parameters<typeof mapProductDetail>[0]) {
  return {
    ...mapProductDetail(row),
    sellerId: row.sellerId,
    storeId: row.storeId,
    categoryId: row.categoryId,
  };
}
