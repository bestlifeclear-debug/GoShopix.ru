import { useId } from 'react';
import styles from './AccountLogoutButton.module.css';

interface AccountLogoutIconProps {
  className?: string;
  variant?: 'gradient' | 'white';
}

export function AccountLogoutIcon({ className, variant = 'gradient' }: AccountLogoutIconProps) {
  const gradientId = useId().replace(/:/g, '');

  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      {variant === 'gradient' && (
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff7062" />
            <stop offset="100%" stopColor="#ff3d2e" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5M15 12H3M10 7l5 5"
        stroke={variant === 'white' ? 'currentColor' : `url(#${gradientId})`}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface AccountLogoutButtonProps {
  onLogout: () => void;
  className?: string;
  size?: 'md' | 'sm';
}

export function AccountLogoutButton({ onLogout, className = '', size = 'md' }: AccountLogoutButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.btn} ${size === 'sm' ? styles.btnSm : ''} ${className}`.trim()}
      onClick={onLogout}
      aria-label="Выйти из аккаунта"
      data-account-logout-icon
      data-testid="account-logout"
    >
      <AccountLogoutIcon className={styles.icon} />
    </button>
  );
}
