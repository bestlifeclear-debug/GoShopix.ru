import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import styles from './CartTrustBadges.module.css';

export function CartTrustBadges() {
  return (
    <p className={styles.root}>
      <Link to="/privacy" className={styles.link}>
        Возврат 14 дней
      </Link>
      <span className={styles.sep} aria-hidden>
        ·
      </span>
      <span className={styles.secure}>
        <ShieldCheck size={13} strokeWidth={2} aria-hidden />
        Безопасная оплата
      </span>
    </p>
  );
}
