import { Link } from 'react-router-dom';
import type { ProductListItem } from '../../api/types';
import { ProductCardSkeleton } from '../../design-system';
import { MobileProductCard } from './MobileProductCard';
import styles from './ProductRail.module.css';

interface ProductRailProps {
  title: string;
  hint?: string;
  linkTo: string;
  linkLabel?: string;
  products: ProductListItem[];
  loading?: boolean;
  onAddToCart?: (product: ProductListItem) => void;
}

export function ProductRail({
  title,
  hint,
  linkTo,
  linkLabel = 'Смотреть все →',
  products,
  loading,
  onAddToCart,
}: ProductRailProps) {
  return (
    <section className={styles.section} aria-labelledby={`rail-${title}`}>
      <div className={styles.head}>
        <div>
          <h2 id={`rail-${title}`} className={styles.title}>
            {title}
          </h2>
          {hint && <p className={styles.hint}>{hint}</p>}
        </div>
        <Link to={linkTo} className={styles.link}>
          {linkLabel}
        </Link>
      </div>

      <div className={styles.trackWrap}>
        <div className={styles.track} role="list">
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.skeletonSlot}>
                <ProductCardSkeleton />
              </div>
            ))}
          {!loading &&
            products.map((product) => (
              <MobileProductCard
                key={product.id}
                product={product}
                onAddToCart={() => onAddToCart?.(product)}
              />
            ))}
        </div>
      </div>
    </section>
  );
}
