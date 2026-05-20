import { Link } from 'react-router-dom';
import { useToastStore } from '../../stores/toastStore';
import styles from './Toast.module.css';

export function Toast() {
  const visible = useToastStore((s) => s.visible);
  const message = useToastStore((s) => s.message);
  const hide = useToastStore((s) => s.hide);

  if (!visible) return null;

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <span className={styles.message}>{message}</span>
      <Link to="/cart" className={styles.link} onClick={hide}>
        В корзину
      </Link>
      <button type="button" className={styles.close} onClick={hide} aria-label="Закрыть">
        ×
      </button>
    </div>
  );
}
