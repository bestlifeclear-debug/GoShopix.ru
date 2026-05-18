import { ProductCard, ProductCardSkeleton } from '../design-system';
import type { ProductListItem } from '../api/types';
import styles from './ProductGrid.module.css';

interface ProductGridProps {
  products: ProductListItem[];
  onAddToCart?: (product: ProductListItem) => void;
  loading?: boolean;
  highlightPrice?: boolean;
  skeletonCount?: number;
}

export function ProductGrid({
  products,
  onAddToCart,
  loading,
  highlightPrice,
  skeletonCount = 8,
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
          promoBadge={product.promoBadge}
          deliveryDaysMin={product.deliveryDaysMin}
          deliveryDaysMax={product.deliveryDaysMax}
          images={product.images}
          highlightPrice={highlightPrice}
          isHit={product.reviewCount >= 30}
          onAddToCart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToCart?.(product);
          }}
        />
      ))}
    </div>
  );
}
