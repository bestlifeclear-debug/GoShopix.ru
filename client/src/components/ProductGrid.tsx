import { formatDeliveryLabel } from '@goshopix/shared';
import { ProductCard, ProductCardSkeleton, ProductSkeleton } from '../design-system';
import type { ProductListItem } from '../api/types';
import styles from './ProductGrid.module.css';

interface ProductGridProps {
  products: ProductListItem[];
  onAddToCart?: (product: ProductListItem) => void;
  loading?: boolean;
  skeletonCount?: number;
  /** Минимум ячеек в сетке; недостающие заполняются ProductSkeleton */
  minSlots?: number;
}

function buildSpecLines(product: ProductListItem): string[] {
  const lines: string[] = [];
  if (product.category?.name) lines.push(product.category.name);
  const delivery = formatDeliveryLabel(product.deliveryDaysMin, product.deliveryDaysMax);
  if (delivery) lines.push(delivery);
  return lines.slice(0, 2);
}

export function ProductGrid({
  products,
  onAddToCart,
  loading,
  skeletonCount = 8,
  minSlots = 0,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className={styles.grid} aria-busy="true" aria-label="Загрузка товаров">
        {Array.from({ length: skeletonCount }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return <p className={styles.message}>Товары не найдены</p>;
  }

  const fillerCount = Math.max(0, minSlots - products.length);

  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          productId={product.id}
          title={product.name}
          brand={product.brand}
          price={product.price}
          compareAtPrice={product.compareAtPrice}
          discountPercent={product.discountPercent}
          rating={product.rating}
          reviewCount={product.reviewCount}
          specLines={buildSpecLines(product)}
          images={product.images}
          onAddToCart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToCart?.(product);
          }}
        />
      ))}
      {fillerCount > 0 &&
        Array.from({ length: fillerCount }, (_, i) => <ProductSkeleton key={`slot-${i}`} />)}
    </div>
  );
}
