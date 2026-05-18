import { Link } from 'react-router-dom';
import type { ProductListItem } from '../../api/types';
import { ProductGrid } from '../ProductGrid';
import styles from './HomeProductSection.module.css';

interface HomeProductSectionProps {
  title: string;
  hint?: string;
  linkTo: string;
  linkLabel: string;
  products: ProductListItem[];
  loading?: boolean;
  onAddToCart?: (product: ProductListItem) => void;
}

export function HomeProductSection({
  title,
  hint,
  linkTo,
  linkLabel,
  products,
  loading,
  onAddToCart,
}: HomeProductSectionProps) {
  return (
    <section className={styles.section} aria-labelledby={`section-${title}`}>
      <div className={styles.head}>
        <div>
          <h2 id={`section-${title}`} className={styles.title}>
            {title}
          </h2>
          {hint && <p className={styles.hint}>{hint}</p>}
        </div>
        <Link to={linkTo} className={styles.link}>
          {linkLabel}
        </Link>
      </div>
      <ProductGrid
        products={products}
        onAddToCart={onAddToCart}
        loading={loading}
        skeletonCount={10}
      />
    </section>
  );
}
