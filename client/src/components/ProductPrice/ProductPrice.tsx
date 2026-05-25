import { formatPrice } from '@goshopix/shared';
import { hasProductDiscount } from '../../lib/productDiscount';
import styles from './ProductPrice.module.css';

export type ProductPriceSize = 'sm' | 'md';

export interface ProductPriceProps {
  price: number;
  compareAtPrice?: number | null;
  size?: ProductPriceSize;
  className?: string;
}

export function ProductPrice({
  price,
  compareAtPrice,
  size = 'sm',
  className = '',
}: ProductPriceProps) {
  const onSale = hasProductDiscount(price, compareAtPrice);
  const rootClass = [styles.root, styles[`size${size.charAt(0).toUpperCase()}${size.slice(1)}`], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      <span className={onSale ? `${styles.price} ${styles.priceOnSale}` : styles.price}>
        {formatPrice(price)}
      </span>
      {onSale && compareAtPrice != null && (
        <span className={styles.oldPrice}>{formatPrice(compareAtPrice)}</span>
      )}
    </div>
  );
}
