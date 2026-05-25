import { formatDeliveryLabel } from '@goshopix/shared';
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

function buildSpecLines(product: ProductListItem): string[] {
  const lines: string[] = [];
  if (product.category?.name) lines.push(product.category.name);
  const delivery = formatDeliveryLabel(product.deliveryDaysMin, product.deliveryDaysMax);
  if (delivery) lines.push(delivery);
  return lines.slice(0, 2);
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
            highlightPrice={Boolean(product.discountPercent && product.discountPercent > 0)}
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
            specLines={buildSpecLines(product)}
            images={product.images}
            onAddToCart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToCart?.(product);
            }}
          />
        ),
      )}
      {fillerCount > 0 &&
        Array.from({ length: fillerCount }, (_, i) => <ProductSkeleton key={`slot-${i}`} />)}
    </div>
  );
}
