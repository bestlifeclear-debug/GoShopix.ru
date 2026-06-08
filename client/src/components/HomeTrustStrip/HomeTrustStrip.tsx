import { CreditCard, RotateCcw, Truck } from 'lucide-react';
import styles from './HomeTrustStrip.module.css';

const ITEMS = [
  { id: 'delivery', label: 'Доставка 0 ₽ от 2 000 ₽', Icon: Truck },
  { id: 'payment', label: 'СБП и карты', Icon: CreditCard },
  { id: 'return', label: 'Возврат 14 дней', Icon: RotateCcw },
] as const;

export function HomeTrustStrip() {
  return (
    <ul className={styles.strip} aria-label="Преимущества покупки на GoShopix">
      {ITEMS.map(({ id, label, Icon }) => (
        <li key={id} className={styles.item}>
          <span className={styles.icon} aria-hidden>
            <Icon size={16} strokeWidth={2.25} />
          </span>
          <span className={styles.label}>{label}</span>
        </li>
      ))}
    </ul>
  );
}
