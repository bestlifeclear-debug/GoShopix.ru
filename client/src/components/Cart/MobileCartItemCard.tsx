import { Minus, Plus, Trash2, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '@goshopix/shared';
import type { CartItem } from '../../api/types';
import { getLinePricing } from '../../lib/cartItemPricing';
import { CartItemCheckbox } from './CartItemCheckbox';
import styles from './MobileCartItemCard.module.css';

type MobileCartItemCardProps = {
  item: CartItem;
  compareAt?: number | null;
  isSelected: boolean;
  deliveryDateLabel: string;
  variantLabel?: string | null;
  onToggle: () => void;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  onProductNavigate?: () => void;
};

export function MobileCartItemCard({
  item,
  compareAt,
  isSelected,
  deliveryDateLabel,
  variantLabel,
  onToggle,
  onUpdateQuantity,
  onRemove,
  onProductNavigate,
}: MobileCartItemCardProps) {
  const { oldLineTotal, lineTotal } = getLinePricing(item, compareAt);
  const optionText = variantLabel ?? item.variant.name;

  return (
    <li className={[styles.card, isSelected ? '' : styles.cardMuted].join(' ')}>
      <button type="button" className={styles.removeBtn} aria-label="Удалить товар" onClick={onRemove}>
        <Trash2 size={16} strokeWidth={1.75} aria-hidden />
      </button>

      <div className={styles.cardTop}>
        <div className={styles.checkboxWrap}>
          <CartItemCheckbox
            checked={isSelected}
            onChange={onToggle}
            ariaLabel={`Выбрать ${item.product.name}`}
          />
        </div>

        <Link
          to={`/product/${item.product.id}`}
          className={styles.thumb}
          onClick={onProductNavigate}
        >
          {item.product.imageUrl ? (
            <img src={item.product.imageUrl} alt="" />
          ) : (
            <span className={styles.thumbPlaceholder} />
          )}
        </Link>

        <div className={styles.cardBody}>
          <Link
            to={`/product/${item.product.id}`}
            className={styles.productName}
            onClick={onProductNavigate}
          >
            {item.product.name}
          </Link>
          {optionText ? <span className={styles.variant}>{optionText}</span> : null}
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
            onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
          >
            <Minus size={14} strokeWidth={2} aria-hidden />
          </button>
          <span className={styles.qtyValue}>{item.quantity}</span>
          <button
            type="button"
            className={styles.qtyBtn}
            aria-label="Увеличить количество"
            onClick={() => onUpdateQuantity(item.quantity + 1)}
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
}
