import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '@goshopix/shared';
import {
  CART_DELIVERY_ESTIMATE_FROM,
  FREE_DELIVERY_FROM,
  type CartLineTotals,
} from '../../lib/checkoutSelection';
import styles from './CartCheckoutSummary.module.css';

type CartCheckoutSummaryProps = {
  lineTotals: CartLineTotals;
  selectedCount: number;
  onCheckout: () => void;
  checkoutLabel: string;
  checkoutDisabled?: boolean;
  trustLine?: ReactNode;
};

export function CartCheckoutSummary({
  lineTotals,
  selectedCount,
  onCheckout,
  checkoutLabel,
  checkoutDisabled = false,
  trustLine,
}: CartCheckoutSummaryProps) {
  const hasSelection = selectedCount > 0;
  const deliverySummaryLine = lineTotals.freeDelivery
    ? 'Доставка: бесплатно'
    : `Доставка от ${formatPrice(CART_DELIVERY_ESTIMATE_FROM)}`;

  const progressPct =
    lineTotals.subtotal > 0
      ? Math.min(100, (lineTotals.subtotal / FREE_DELIVERY_FROM) * 100)
      : 0;

  return (
    <div className={styles.root}>
      <div className={styles.summaryBlock}>
        {lineTotals.discount > 0 && hasSelection ? (
          <div className={`${styles.summaryRow} ${styles.summaryRowSavings}`}>
            <span>Экономия</span>
            <strong>−{formatPrice(lineTotals.discount)}</strong>
          </div>
        ) : null}

        <div className={styles.deliveryRow}>
          <span>{deliverySummaryLine}</span>
          {!lineTotals.freeDelivery && lineTotals.subtotal > 0 && hasSelection ? (
            <span className={styles.deliveryHint}>
              Ещё {formatPrice(lineTotals.deliveryRemaining)} до бесплатной доставки
            </span>
          ) : null}
        </div>

        {!lineTotals.freeDelivery && lineTotals.subtotal > 0 && hasSelection ? (
          <div className={styles.progressTrack} aria-hidden>
            <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
          </div>
        ) : null}

        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>
            К оплате{selectedCount > 0 ? ` · ${selectedCount} шт.` : ''}
          </span>
          <strong className={styles.totalAmount}>{formatPrice(lineTotals.subtotal)}</strong>
        </div>
      </div>

      <button
        type="button"
        className={styles.checkoutBtn}
        onClick={onCheckout}
        disabled={checkoutDisabled || !hasSelection}
      >
        {checkoutLabel}
      </button>

      {trustLine ?? (
        <p className={styles.trustLine}>
          <Link to="/privacy" className={styles.trustLink}>
            Возврат 14 дней
          </Link>
        </p>
      )}
    </div>
  );
}
