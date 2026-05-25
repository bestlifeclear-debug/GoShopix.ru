import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { useToastStore } from '../../stores/toastStore';
import styles from './Toast.module.css';

export function Toast() {
  const visible = useToastStore((s) => s.visible);
  const message = useToastStore((s) => s.message);
  const kind = useToastStore((s) => s.kind);
  const hide = useToastStore((s) => s.hide);
  const token = useAuthStore((s) => s.token);
  const openDrawer = useCartStore((s) => s.openDrawer);

  if (!visible) return null;

  const handleCartAction = () => {
    hide();
    if (!token) {
      openDrawer();
      return;
    }
  };

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <span className={styles.message}>{message}</span>
      {kind === 'cart' &&
        (token ? (
          <Link to="/cart" className={styles.link} onClick={hide}>
            В корзину
          </Link>
        ) : (
          <button type="button" className={styles.link} onClick={handleCartAction}>
            В корзину
          </button>
        ))}
      <button type="button" className={styles.close} onClick={hide} aria-label="Закрыть">
        ×
      </button>
    </div>
  );
}
