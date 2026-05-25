import { useEffect, useState } from 'react';
import { formatPrice } from '@goshopix/shared';
import { Link } from 'react-router-dom';
import { productsApi } from '../../api/index';
import type { ProductListItem } from '../../api/types';
import styles from './CartRecommendations.module.css';

type CartRecommendationsProps = {
  onAdd?: (product: ProductListItem) => void;
  title?: string;
};

export function CartRecommendations({
  onAdd,
  title = 'Добавьте к заказу',
}: CartRecommendationsProps) {
  const [items, setItems] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void productsApi
      .list({ page: 1, limit: 6, sort: 'popular' })
      .then((res) => {
        if (!cancelled) setItems(res.items.slice(0, 6));
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
  }, []);

  if (loading || items.length === 0) return null;

  return (
    <section className={styles.root} aria-label={title}>
      <h3 className={styles.title}>{title}</h3>
      <ul className={styles.rail}>
        {items.map((product) => (
          <li key={product.id} className={styles.card}>
            <Link to={`/product/${product.id}`} className={styles.thumb}>
              {product.imageUrl ? (
                <img src={product.imageUrl} alt="" />
              ) : (
                <span className={styles.thumbPlaceholder} />
              )}
            </Link>
            <Link to={`/product/${product.id}`} className={styles.name}>
              {product.name}
            </Link>
            <div className={styles.priceRow}>
              <span className={styles.price}>{formatPrice(product.price)}</span>
              {product.compareAtPrice != null && product.compareAtPrice > product.price ? (
                <span className={styles.oldPrice}>{formatPrice(product.compareAtPrice)}</span>
              ) : null}
            </div>
            {onAdd ? (
              <button type="button" className={styles.addBtn} onClick={() => onAdd(product)}>
                В корзину
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
