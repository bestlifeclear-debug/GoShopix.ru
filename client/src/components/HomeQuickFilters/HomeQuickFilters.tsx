import { Link } from 'react-router-dom';
import { IconFilter } from '../../design-system/icons/Icons';
import styles from './HomeQuickFilters.module.css';

const CHIPS = [
  { label: 'Популярное', to: '/catalog?sort=popular' },
  { label: 'Новинки', to: '/catalog?sort=newest' },
  { label: 'Скидки', to: '/catalog?sort=price_asc' },
  { label: 'Электроника', to: '/catalog?categorySlug=electronics' },
  { label: 'Одежда', to: '/catalog?categorySlug=clothing' },
  { label: 'Смартфоны', to: '/catalog?categorySlug=smartphones' },
] as const;

export function HomeQuickFilters() {
  return (
    <section className={styles.section} aria-label="Быстрые фильтры каталога">
      <div className={styles.row}>
        <div className={styles.chips}>
          {CHIPS.map((chip) => (
            <Link key={chip.to} to={chip.to} className={styles.chip}>
              {chip.label}
            </Link>
          ))}
        </div>
        <Link to="/catalog" className={styles.allFilters}>
          <IconFilter />
          Все фильтры
        </Link>
      </div>
    </section>
  );
}
