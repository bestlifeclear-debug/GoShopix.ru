import { formatPrice } from '@goshopix/shared';
import { Link } from 'react-router-dom';
import type { ProductListItem } from '../../api/types';
import { StarRating } from '../../design-system';
import styles from './MobileProductCard.module.css';

interface MobileProductCardProps {
  product: ProductListItem;
  highlightPrice?: boolean;
  onAddToCart?: () => void;
}

export function MobileProductCard({ product, highlightPrice, onAddToCart }: MobileProductCardProps) {
  const image = product.images?.[0]?.url ?? product.imageUrl ?? undefined;
  const hasDiscount = product.compareAtPrice != null && product.compareAtPrice > product.price;

  return (
    <article className={styles.card}>
      <Link to={`/product/${product.id}`} className={styles.mediaLink}>
        {product.discountPercent != null && product.discountPercent > 0 && (
          <span className={styles.badge}>−{product.discountPercent}%</span>
        )}
        {image ? (
          <img src={image} alt={product.name} className={styles.image} loading="lazy" />
        ) : (
          <span className={styles.placeholder}>GoShopix</span>
        )}
      </Link>
      <div className={styles.body}>
        <Link to={`/product/${product.id}`} className={styles.title}>
          {product.name}
        </Link>
        <StarRating value={product.rating} reviewCount={product.reviewCount} size="sm" />
        <div className={`${styles.prices} ${highlightPrice ? styles.pricesSale : ''}`}>
          <span className={styles.price}>{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className={styles.oldPrice}>{formatPrice(product.compareAtPrice!)}</span>
          )}
        </div>
        <button type="button" className={styles.cartBtn} onClick={onAddToCart}>
          В корзину
        </button>
      </div>
    </article>
  );
}
