import { Link } from 'react-router-dom';
import { IconFilter } from '../../design-system/icons/Icons';
import styles from './HomeQuickFilters.module.css';

const MOBILE_CHIPS = [
  { label: 'Популярное', to: '/catalog?sort=popular' },
  { label: 'Новинки', to: '/catalog?sort=newest' },
  { label: 'Скидки', to: '/catalog?sort=price_asc' },
] as const;

const DESKTOP_CHIPS = [
  ...MOBILE_CHIPS,
  { label: 'Электроника', to: '/catalog?categorySlug=electronics' },
  { label: 'Одежда', to: '/catalog?categorySlug=clothing' },
  { label: 'Смартфоны', to: '/catalog?categorySlug=smartphones' },
] as const;

interface HomeQuickFiltersProps {
  variant?: 'full' | 'compact';
}

export function HomeQuickFilters({ variant = 'full' }: HomeQuickFiltersProps) {
  const chips = variant === 'compact' ? MOBILE_CHIPS : DESKTOP_CHIPS;

  return (
    <section
      className={`${styles.section} ${variant === 'compact' ? styles.sectionCompact : ''}`}
      aria-label="Быстрые фильтры каталога"
    >
      <div className={styles.row}>
        <div className={styles.chips}>
          {chips.map((chip) => (
            <Link key={chip.to} to={chip.to} className={styles.chip}>
              {chip.label}
            </Link>
          ))}
        </div>
        {variant === 'full' && (
          <Link to="/catalog" className={styles.allFilters}>
            <IconFilter />
            Все фильтры
          </Link>
        )}
      </div>
    </section>
  );
}
