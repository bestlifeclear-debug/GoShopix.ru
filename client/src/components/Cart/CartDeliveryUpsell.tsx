import { Link } from 'react-router-dom';
import { formatPrice } from '@goshopix/shared';
import type { CartLineTotals } from '../../lib/checkoutSelection';
import styles from './CartDeliveryUpsell.module.css';

type CartDeliveryUpsellProps = {
  lineTotals: CartLineTotals;
  compact?: boolean;
};

export function CartDeliveryUpsell({ lineTotals, compact = false }: CartDeliveryUpsellProps) {
  if (lineTotals.freeDelivery || lineTotals.subtotal <= 0 || lineTotals.deliveryRemaining <= 0) {
    return null;
  }

  return (
    <div className={`${styles.root} ${compact ? styles.compact : ''}`}>
      <p className={styles.text}>
        Добавьте ещё на{' '}
        <strong>{formatPrice(lineTotals.deliveryRemaining)}</strong> — бесплатная доставка
      </p>
      <Link to="/categories" className={styles.link}>
        Подобрать товары
      </Link>
    </div>
  );
}
