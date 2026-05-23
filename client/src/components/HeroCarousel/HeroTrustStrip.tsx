import { HERO_TRUST_ITEMS } from './heroSlides.js';
import styles from './HeroTrustStrip.module.css';

export function HeroTrustStrip() {
  return (
    <ul className={styles.strip} aria-label="Преимущества GoShopix">
      {HERO_TRUST_ITEMS.map((item) => (
        <li key={item.id} className={styles.item}>
          <span className={styles.icon} aria-hidden>
            {item.icon}
          </span>
          <span className={styles.label}>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
