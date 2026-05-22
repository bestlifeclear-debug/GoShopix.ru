import { formatPrice } from '@goshopix/shared';
import { Link } from 'react-router-dom';
import type { ProductListItem } from '../../api/types';
import { IconPlus } from '../../design-system/icons/Icons';
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
      <div className={styles.media}>
        <Link to={`/product/${product.id}`} className={styles.mediaLink} aria-label={product.name}>
          {product.discountPercent != null && product.discountPercent > 0 && (
            <span className={styles.badge}>−{product.discountPercent}%</span>
          )}
          {image ? (
            <img src={image} alt="" className={styles.image} loading="lazy" />
          ) : (
            <span className={styles.placeholder} aria-hidden />
          )}
        </Link>
        <button
          type="button"
          className={styles.addBtn}
          onClick={(e) => {
            e.preventDefault();
            onAddToCart?.();
          }}
          aria-label={`Добавить ${product.name} в корзину`}
        >
          <IconPlus className={styles.addIcon} />
        </button>
      </div>

      <div className={styles.body}>
        <div className={`${styles.prices} ${highlightPrice ? styles.pricesSale : ''}`}>
          <span className={styles.price}>{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className={styles.oldPrice}>{formatPrice(product.compareAtPrice!)}</span>
          )}
        </div>
        <Link to={`/product/${product.id}`} className={styles.title}>
          {product.name}
        </Link>
      </div>
    </article>
  );
}
