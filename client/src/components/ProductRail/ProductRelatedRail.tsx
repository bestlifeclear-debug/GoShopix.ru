import type { ProductListItem } from '../../api/types';
import { MobileProductCard } from './MobileProductCard';
import styles from './ProductRelatedRail.module.css';

interface ProductRelatedRailProps {
  title: string;
  products: ProductListItem[];
  onAddToCart?: (product: ProductListItem) => void;
}

export function ProductRelatedRail({ title, products, onAddToCart }: ProductRelatedRailProps) {
  if (products.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby={`related-${title}`}>
      <h2 id={`related-${title}`} className={styles.title}>
        {title}
      </h2>
      <div className={styles.trackWrap}>
        <div className={styles.track} role="list">
          {products.map((product) => (
            <div key={product.id} className={styles.slot} role="listitem">
              <MobileProductCard
                product={product}
                showFavorite={false}
                onAddToCart={() => onAddToCart?.(product)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
