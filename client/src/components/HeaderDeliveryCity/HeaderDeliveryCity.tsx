import { useEffect, useState } from 'react';
import { cityDetectApi } from '../../api';
import { DEFAULT_DELIVERY_CITY, readDeliveryCity, writeDeliveryCity } from '../../lib/deliveryCity';
import styles from './HeaderDeliveryCity.module.css';

interface HeaderDeliveryCityProps {
  /** Компактная строка над поиском на мобилке (без иконки, 12px) */
  variant?: 'default' | 'compact';
}

export function HeaderDeliveryCity({ variant = 'default' }: HeaderDeliveryCityProps) {
  const [city, setCity] = useState(() => readDeliveryCity() ?? DEFAULT_DELIVERY_CITY);

  useEffect(() => {
    const stored = readDeliveryCity();
    if (stored) {
      setCity(stored);
      return;
    }

    void cityDetectApi.detect().then((res) => {
      const detected = res.city?.trim();
      if (!detected) return;
      writeDeliveryCity(detected);
      setCity(detected);
    });
  }, []);

  if (variant === 'compact') {
    return (
      <div className={`${styles.root} ${styles.compact}`} aria-label={`Город доставки: ${city}`} title={city}>
        <span className={styles.text}>
          <span className={styles.compactPrefix}>Доставка в</span>
          <span className={styles.city}>{city}</span>
        </span>
      </div>
    );
  }

  return (
    <div className={styles.root} aria-label={`Город доставки: ${city}`} title={city}>
      <span className={styles.icon} aria-hidden>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="2" />
        </svg>
      </span>
      <span className={styles.text}>
        <span className={styles.label}>Город:</span>{' '}
        <span className={styles.city}>{city}</span>
      </span>
    </div>
  );
}

/** Десктоп + мобильная строка над поиском */
export function HeaderDeliveryCitySlots() {
  return (
    <>
      <HeaderDeliveryCity />
      <HeaderDeliveryCity variant="compact" />
    </>
  );
}
