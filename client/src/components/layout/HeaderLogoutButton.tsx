import { IconLogOut } from '../../design-system/icons/Icons';
import styles from './HeaderLogoutButton.module.css';

interface HeaderLogoutButtonProps {
  onLogout: () => void;
  /** Кнопка в красной панели действий десктопного хедера */
  variant?: 'mobile' | 'nav';
}

export function HeaderLogoutButton({ onLogout, variant = 'mobile' }: HeaderLogoutButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.root} ${variant === 'nav' ? styles.rootNav : ''}`}
      onClick={onLogout}
      aria-label="Выйти из аккаунта"
      data-testid="header-logout"
    >
      <span className={styles.iconWrap}>
        <IconLogOut className={styles.icon} strokeWidth={1.75} />
      </span>
    </button>
  );
}
