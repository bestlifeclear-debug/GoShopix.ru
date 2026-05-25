import { useMemo } from 'react';
import { Minus, Plus, Trash2, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '@goshopix/shared';
import type { CartItem } from '../../api/types';
import { type CartLineTotals } from '../../lib/checkoutSelection';
import { formatEstimatedDeliveryDate } from '../../lib/cartDeliveryDate';
import { CartCheckoutSummary } from './CartCheckoutSummary';
import { CartItemCheckbox } from './CartItemCheckbox';
import styles from './MobileCartList.module.css';

interface MobileCartListProps {
  items: CartItem[];
  compareAtByProduct: Record<string, number | null>;
  selectedIds: Set<string>;
  lineTotals: CartLineTotals;
  onToggleItem: (itemId: string) => void;
  onToggleAll: () => void;
  allSelected: boolean;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  selectedCount: number;
  onCheckout: () => void;
}

function getLinePricing(item: CartItem, compareAt: number | null | undefined) {
  const unitCompareAt =
    compareAt != null && compareAt > item.unitPrice ? compareAt : null;
  const oldLineTotal = unitCompareAt != null ? unitCompareAt * item.quantity : null;
  return { oldLineTotal, lineTotal: item.lineTotal };
}

function formatItemCount(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod100 >= 11 && mod100 <= 14) return `${count} товаров`;
  if (mod10 === 1) return `${count} товар`;
  if (mod10 >= 2 && mod10 <= 4) return `${count} товара`;
  return `${count} товаров`;
}

export function MobileCartList({
  items,
  compareAtByProduct,
  selectedIds,
  lineTotals,
  onToggleItem,
  onToggleAll,
  allSelected,
  onUpdateQuantity,
  onRemoveItem,
  selectedCount,
  onCheckout,
}: MobileCartListProps) {
  const deliveryDateLabel = useMemo(() => formatEstimatedDeliveryDate(7), []);
  const totalQty = useMemo(() => items.reduce((n, i) => n + i.quantity, 0), [items]);

  return (
    <div className={styles.root}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Корзина</h1>
        <p className={styles.pageMeta}>{formatItemCount(totalQty)}</p>
      </header>

      <div className={styles.selectAllRow}>
        <CartItemCheckbox
          checked={allSelected}
          onChange={() => onToggleAll()}
          ariaLabel="Выбрать все товары"
        />
        <button type="button" className={styles.selectAllBtn} onClick={onToggleAll}>
          Выбрать всё
        </button>
      </div>

      <ul className={styles.list}>
        {items.map((item) => {
          const isSelected = selectedIds.has(item.id);
          const compareAt = compareAtByProduct[item.product.id];
          const { oldLineTotal, lineTotal } = getLinePricing(item, compareAt);

          return (
            <li
              key={item.id}
              className={[styles.card, isSelected ? '' : styles.cardMuted].join(' ')}
            >
              <button
                type="button"
                className={styles.removeBtn}
                aria-label="Удалить товар"
                onClick={() => onRemoveItem(item.id)}
              >
                <Trash2 size={16} strokeWidth={1.75} aria-hidden />
              </button>

              <div className={styles.cardTop}>
                <div className={styles.checkboxWrap}>
                  <CartItemCheckbox
                    checked={isSelected}
                    onChange={() => onToggleItem(item.id)}
                    ariaLabel={`Выбрать ${item.product.name}`}
                  />
                </div>

                <Link
                  to={`/product/${item.product.id}`}
                  className={styles.thumb}
                >
                  {item.product.imageUrl ? (
                    <img src={item.product.imageUrl} alt="" />
                  ) : (
                    <span className={styles.thumbPlaceholder} />
                  )}
                </Link>

                <div className={styles.cardBody}>
                  <Link to={`/product/${item.product.id}`} className={styles.productName}>
                    {item.product.name}
                  </Link>
                  {item.variant.name ? (
                    <span className={styles.variant}>{item.variant.name}</span>
                  ) : null}
                  <p className={styles.deliveryEta}>
                    <Truck size={12} strokeWidth={1.75} aria-hidden />
                    <span>Доставка ~{deliveryDateLabel}</span>
                  </p>
                </div>
              </div>

              <div className={styles.cardBottom}>
                <div className={styles.qtyControl}>
                  <button
                    type="button"
                    className={styles.qtyBtn}
                    aria-label="Уменьшить количество"
                    onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  >
                    <Minus size={14} strokeWidth={2} aria-hidden />
                  </button>
                  <span className={styles.qtyValue}>{item.quantity}</span>
                  <button
                    type="button"
                    className={styles.qtyBtn}
                    aria-label="Увеличить количество"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.variant.stock}
                  >
                    <Plus size={14} strokeWidth={2} aria-hidden />
                  </button>
                </div>

                <div className={styles.priceCol}>
                  {oldLineTotal != null ? (
                    <span className={styles.oldPrice}>{formatPrice(oldLineTotal)}</span>
                  ) : null}
                  <span className={styles.price}>{formatPrice(lineTotal)}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className={styles.stickyPanel}>
        <CartCheckoutSummary
          lineTotals={lineTotals}
          selectedCount={selectedCount}
          onCheckout={onCheckout}
          checkoutLabel="Оформить заказ"
        />
      </div>
    </div>
  );
}
