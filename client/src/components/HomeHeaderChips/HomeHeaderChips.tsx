import { Link } from 'react-router-dom';
import { IconPercent, IconStar, IconTruck, IconZap } from '../../design-system/icons/Icons';
import styles from './HomeHeaderChips.module.css';

const CHIPS = [
  { label: 'Скидки', to: '/catalog?sort=price_asc', icon: IconPercent, tone: 'sale' },
  { label: 'Акции', to: '/catalog?sort=price_asc', icon: IconZap, tone: 'promo' },
  { label: 'Доставка', to: '/catalog', icon: IconTruck, tone: 'delivery' },
  { label: 'Новинки', to: '/catalog?sort=newest', icon: IconStar, tone: 'new' },
] as const;

export function HomeHeaderChips() {
  return (
    <div className={styles.wrap} data-header-chips aria-label="Быстрые разделы">
      <div className={styles.track}>
        {CHIPS.map((chip) => {
          const Icon = chip.icon;
          return (
            <Link key={chip.label} to={chip.to} className={styles.chip}>
              <span className={`${styles.iconWrap} ${styles[`tone${chip.tone}`]}`} aria-hidden>
                <Icon />
              </span>
              <span className={styles.label}>{chip.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
