import { resolveProductDeliveryDays } from '@goshopix/shared';
import { useEffect, useState } from 'react';
import { ProductCard, ProductCardSkeleton, ProductSkeleton } from '../design-system';
import type { ProductListItem } from '../api/types';
import { MobileProductCard } from './ProductRail/MobileProductCard';
import styles from './ProductGrid.module.css';

interface ProductGridProps {
  products: ProductListItem[];
  onAddToCart?: (product: ProductListItem) => void;
  loading?: boolean;
  skeletonCount?: number;
  /** Минимум ячеек в сетке; недостающие заполняются ProductSkeleton */
  minSlots?: number;
  /** compact — 2 колонки и MobileProductCard на мобилке (каталог, листинги) */
  variant?: 'standard' | 'compact';
  /** Без кнопки избранного (корзина, рекомендации) */
  hideFavorite?: boolean;
}

function useMaxWidth(query: string) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    setMatches(mq.matches);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

function CompactCardSkeleton() {
  return (
    <div className={styles.compactSkeleton} aria-hidden>
      <div className={styles.compactSkeletonMedia} />
      <div className={styles.compactSkeletonLine} />
      <div className={`${styles.compactSkeletonLine} ${styles.compactSkeletonLineShort}`} />
      <div className={styles.compactSkeletonBtn} />
    </div>
  );
}

export function ProductGrid({
  products,
  onAddToCart,
  loading,
  skeletonCount = 8,
  minSlots = 0,
  variant = 'standard',
  hideFavorite = false,
}: ProductGridProps) {
  const isMobile = useMaxWidth('(max-width: 767px)');
  const useCompactCards = variant === 'compact' && isMobile;

  const gridClass =
    variant === 'compact'
      ? `${styles.grid} ${styles.gridCompact}`
      : styles.grid;

  if (loading) {
    return (
      <div className={gridClass} aria-busy="true" aria-label="Загрузка товаров">
        {Array.from({ length: skeletonCount }, (_, i) =>
          useCompactCards ? (
            <CompactCardSkeleton key={i} />
          ) : (
            <ProductCardSkeleton key={i} />
          ),
        )}
      </div>
    );
  }

  if (products.length === 0) {
    return <p className={styles.message}>Товары не найдены</p>;
  }

  const fillerCount = Math.max(0, minSlots - products.length);

  return (
    <div className={gridClass}>
      {products.map((product) =>
        useCompactCards ? (
          <MobileProductCard
            key={product.id}
            product={product}
            showFavorite={!hideFavorite}
            onAddToCart={() => onAddToCart?.(product)}
          />
        ) : (
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
            deliveryDays={resolveProductDeliveryDays(
              product.deliveryDaysMin,
              product.deliveryDaysMax,
            )}
            images={product.images}
            onAddToCart={() => onAddToCart?.(product)}
          />
        ),
      )}
      {fillerCount > 0 &&
        Array.from({ length: fillerCount }, (_, i) => <ProductSkeleton key={`slot-${i}`} />)}
    </div>
  );
}
