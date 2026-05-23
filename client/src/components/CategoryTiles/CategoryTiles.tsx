import { Link } from 'react-router-dom';
import type { CategoryNode } from '../../api/types';
import { categoryImageUrl } from '../../lib/categoryImages';
import styles from './CategoryTiles.module.css';

interface CategoryTilesProps {
  categories: CategoryNode[];
  variant?: 'default' | 'mobile';
}

export function CategoryTiles({ categories, variant = 'default' }: CategoryTilesProps) {
  const roots = categories.filter((c) => !c.parentId);
  const children = categories.flatMap((c) => c.children);
  const tiles = variant === 'mobile' ? roots.slice(0, 10) : [...roots, ...children];

  if (tiles.length === 0) return null;

  return (
    <div
      className={`${styles.scroll} ${variant === 'mobile' ? styles.scrollMobile : ''}`}
      role="list"
    >
      {tiles.map((cat) => (
        <Link
          key={cat.id}
          to={`/catalog?categorySlug=${cat.slug}`}
          className={styles.tile}
          role="listitem"
        >
          <span className={styles.imageBox}>
            <img
              src={categoryImageUrl(cat.slug)}
              alt=""
              className={styles.image}
              loading="lazy"
            />
          </span>
          <span className={styles.label}>{cat.name}</span>
        </Link>
      ))}
    </div>
  );
}

interface CategorySectionProps {
  categories: CategoryNode[];
  catalogLink?: string;
}

/** Секция категорий на главной (мобилка): заголовок + горизонтальный скролл */
export function CategorySection({ categories, catalogLink = '/catalog' }: CategorySectionProps) {
  const roots = categories.filter((c) => !c.parentId);
  if (roots.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="home-categories-title">
      <div className={styles.sectionHead}>
        <h2 id="home-categories-title" className={styles.sectionTitle}>
          Категории
        </h2>
        <Link to={catalogLink} className={styles.sectionLink}>
          Все →
        </Link>
      </div>
      <div className={styles.trackWrap}>
        <CategoryTiles categories={categories} variant="mobile" />
      </div>
    </section>
  );
}
