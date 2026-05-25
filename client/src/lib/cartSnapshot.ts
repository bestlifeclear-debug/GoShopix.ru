import type { ProductDetail, ProductListItem, ProductVariant } from '../api/types.js';
import type { CartItemSnapshot } from './guestCart.js';

export function snapshotFromVariant(
  product: Pick<ProductListItem, 'id' | 'name' | 'slug' | 'imageUrl' | 'compareAtPrice'>,
  variant: ProductVariant,
): CartItemSnapshot {
  return {
    variantId: variant.id,
    productId: product.id,
    productName: product.name,
    productSlug: product.slug,
    variantName: variant.name,
    unitPrice: variant.price,
    compareAtPrice: product.compareAtPrice ?? null,
    stock: variant.stock,
    imageUrl: variant.images[0]?.url ?? product.imageUrl,
  };
}

export function snapshotFromDetail(product: ProductDetail, variant: ProductVariant): CartItemSnapshot {
  return snapshotFromVariant(product, variant);
}
