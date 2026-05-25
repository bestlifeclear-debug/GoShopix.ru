import { useMemo } from 'react';
import type { CartItem, ProductListItem } from '../../api/types';
import { type CartLineTotals } from '../../lib/checkoutSelection';
import { formatEstimatedDeliveryDate } from '../../lib/cartDeliveryDate';
import { CartCheckoutSummary } from './CartCheckoutSummary';
import { CartItemCheckbox } from './CartItemCheckbox';
import { CartRecommendations } from './CartRecommendations';
import { MobileCartItemCard } from './MobileCartItemCard';
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
  onQuickCheckout?: () => void;
  getVariantLabel?: (item: CartItem) => string | null;
  onRecommendAdd?: (product: ProductListItem) => void;
  checkoutLabel?: string;
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
  onQuickCheckout,
  getVariantLabel,
  onRecommendAdd,
  checkoutLabel = 'Оформить заказ',
}: MobileCartListProps) {
  const deliveryDateLabel = useMemo(() => formatEstimatedDeliveryDate(7), []);
  const totalQty = useMemo(() => items.reduce((n, i) => n + i.quantity, 0), [items]);
  const showQuickBuy = items.length === 1 && selectedIds.size === 1;

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <CartItemCheckbox
          checked={allSelected}
          onChange={() => onToggleAll()}
          ariaLabel="Выбрать все товары"
        />
        <button type="button" className={styles.selectAllBtn} onClick={onToggleAll}>
          Выбрать всё
        </button>
        <span className={styles.itemCount}>{formatItemCount(totalQty)}</span>
      </div>

      <div className={styles.scrollArea}>
        <ul className={styles.list}>
          {items.map((item) => (
            <MobileCartItemCard
              key={item.id}
              item={item}
              compareAt={compareAtByProduct[item.product.id]}
              isSelected={selectedIds.has(item.id)}
              deliveryDateLabel={deliveryDateLabel}
              variantLabel={getVariantLabel?.(item) ?? null}
              onToggle={() => onToggleItem(item.id)}
              onUpdateQuantity={(qty) => onUpdateQuantity(item.id, qty)}
              onRemove={() => onRemoveItem(item.id)}
            />
          ))}
        </ul>

        {onRecommendAdd ? (
          <CartRecommendations onAdd={onRecommendAdd} variant="page" limit={6} />
        ) : null}
      </div>

      <div className={styles.stickyPanel}>
        <CartCheckoutSummary
          lineTotals={lineTotals}
          selectedCount={selectedCount}
          onCheckout={onCheckout}
          onQuickCheckout={onQuickCheckout}
          showQuickBuy={showQuickBuy && Boolean(onQuickCheckout)}
          checkoutLabel={checkoutLabel}
        />
      </div>
    </div>
  );
}
