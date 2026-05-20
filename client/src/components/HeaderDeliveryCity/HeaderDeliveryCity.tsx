import { useEffect, useState } from 'react';
import { cityDetectApi } from '../../api';
import { DEFAULT_DELIVERY_CITY, readDeliveryCity, writeDeliveryCity } from '../../lib/deliveryCity';
import styles from './HeaderDeliveryCity.module.css';

type HeaderDeliveryCityProps = {
  className?: string;
};

export function HeaderDeliveryCity({ className }: HeaderDeliveryCityProps) {
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

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} title={`Доставка в ${city}`}>
      <span className={styles.icon} aria-hidden>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="11" r="2.25" stroke="currentColor" strokeWidth="1.75" />
        </svg>
      </span>
      <p className={styles.text}>
        <span className={styles.prefix}>Доставка в</span>
        <span className={styles.city}>{city}</span>
      </p>
    </div>
  );
}
