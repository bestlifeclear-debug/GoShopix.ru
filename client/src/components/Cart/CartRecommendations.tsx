import { useEffect, useState } from 'react';
import { productsApi } from '../../api/index';
import type { ProductListItem } from '../../api/types';
import { MobileProductCard } from '../ProductRail/MobileProductCard';
import styles from './CartRecommendations.module.css';

type CartRecommendationsProps = {
  onAdd?: (product: ProductListItem) => void;
  title?: string;
  limit?: number;
  variant?: 'page' | 'drawer';
};

export function CartRecommendations({
  onAdd,
  title = 'Может пригодиться',
  limit = 6,
  variant = 'page',
}: CartRecommendationsProps) {
  const [items, setItems] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void productsApi
      .list({ page: 1, limit: Math.max(limit, 6), sort: 'popular' })
      .then((res) => {
        if (!cancelled) setItems(res.items.slice(0, limit));
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [limit]);

  if (loading || items.length === 0) return null;

  return (
    <section
      className={[styles.root, variant === 'drawer' ? styles.rootDrawer : ''].filter(Boolean).join(' ')}
      aria-label={title}
    >
      <h3 className={styles.title}>{title}</h3>
      <ul className={styles.rail}>
        {items.map((product) => {
          const hasDiscount =
            product.compareAtPrice != null && product.compareAtPrice > product.price;
          return (
            <li key={product.id} className={styles.railItem}>
              <MobileProductCard
                product={product}
                highlightPrice={hasDiscount}
                showFavorite={false}
                onAddToCart={onAdd ? () => onAdd(product) : undefined}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
