import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '@goshopix/shared';
import {
  CART_DELIVERY_ESTIMATE_FROM,
  FREE_DELIVERY_FROM,
  type CartLineTotals,
} from '../../lib/checkoutSelection';
import { CartTrustBadges } from './CartTrustBadges';
import styles from './CartCheckoutSummary.module.css';

type CartCheckoutSummaryProps = {
  lineTotals: CartLineTotals;
  selectedCount: number;
  onCheckout: () => void;
  checkoutLabel: string;
  checkoutDisabled?: boolean;
  trustLine?: ReactNode;
  onQuickCheckout?: () => void;
  showQuickBuy?: boolean;
};

export function CartCheckoutSummary({
  lineTotals,
  selectedCount,
  onCheckout,
  checkoutLabel,
  checkoutDisabled = false,
  trustLine,
  onQuickCheckout,
  showQuickBuy = false,
}: CartCheckoutSummaryProps) {
  const hasSelection = selectedCount > 0;
  const deliverySummaryLine = lineTotals.freeDelivery
    ? 'Доставка: бесплатно'
    : `Доставка от ${formatPrice(CART_DELIVERY_ESTIMATE_FROM)}`;

  const progressPct =
    lineTotals.subtotal > 0
      ? Math.min(100, (lineTotals.subtotal / FREE_DELIVERY_FROM) * 100)
      : 0;

  /** Почти заполненный бар на 320px выглядит как «красная полоса» — показываем только при заметном остатке */
  const showDeliveryProgress =
    !lineTotals.freeDelivery &&
    lineTotals.subtotal > 0 &&
    hasSelection &&
    lineTotals.deliveryRemaining > 150;

  const showDeliveryHint =
    !lineTotals.freeDelivery &&
    lineTotals.subtotal > 0 &&
    hasSelection &&
    lineTotals.deliveryRemaining > 0;

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
          {showDeliveryHint ? (
            <span className={styles.deliveryHint}>
              {lineTotals.deliveryRemaining <= 150
                ? `Осталось ${formatPrice(lineTotals.deliveryRemaining)} до бесплатной доставки`
                : `Ещё ${formatPrice(lineTotals.deliveryRemaining)} до бесплатной доставки`}
              {!lineTotals.freeDelivery ? (
                <>
                  {' · '}
                  <Link to="/categories" className={styles.deliveryLink}>
                    Подобрать
                  </Link>
                </>
              ) : null}
            </span>
          ) : null}
        </div>

        {showDeliveryProgress ? (
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

      {showQuickBuy && onQuickCheckout ? (
        <button
          type="button"
          className={styles.quickBuyLink}
          onClick={onQuickCheckout}
          disabled={checkoutDisabled || !hasSelection}
        >
          Купить в 1 клик
        </button>
      ) : null}

      {trustLine ?? <CartTrustBadges />}
    </div>
  );
}
