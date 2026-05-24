import { useEffect, useState } from 'react';
import { cityDetectApi } from '../../api';
import { DEFAULT_DELIVERY_CITY, readDeliveryCity, writeDeliveryCity } from '../../lib/deliveryCity';
import { IconLocation } from './AccountIcons';
import { AccountLogoutButton } from './AccountLogoutButton';
import styles from './AccountProfileBar.module.css';

interface AccountProfileBarProps {
  displayName: string;
  avatarUrl?: string | null;
  onLogout: () => void;
}

function profileInitial(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  return trimmed.charAt(0).toUpperCase();
}

export function AccountProfileBar({ displayName, avatarUrl, onLogout }: AccountProfileBarProps) {
  const [deliveryCity, setDeliveryCity] = useState(() => readDeliveryCity() ?? DEFAULT_DELIVERY_CITY);

  useEffect(() => {
    const stored = readDeliveryCity();
    if (stored) {
      setDeliveryCity(stored);
      return;
    }
    void cityDetectApi.detect().then((res) => {
      const detected = res.city?.trim();
      if (!detected) return;
      writeDeliveryCity(detected);
      setDeliveryCity(detected);
    });
  }, []);

  return (
    <header className={styles.bar} aria-label="Профиль">
      <div className={styles.avatar} aria-hidden>
        <span className={styles.avatarInner}>
          {avatarUrl ? <img src={avatarUrl} alt="" /> : profileInitial(displayName)}
        </span>
        <span className={styles.avatarAdd} aria-hidden>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
      </div>
      <div className={styles.meta}>
        <p className={styles.name}>{displayName}</p>
        <p className={styles.locationBadge}>
          <IconLocation />
          <span>{deliveryCity}</span>
        </p>
      </div>
      <AccountLogoutButton onLogout={onLogout} className={styles.logout} />
    </header>
  );
}
