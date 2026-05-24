import { Link } from 'react-router-dom';
import type { CategoryNode } from '../../api/types';
import { IconCatalog } from '../../design-system/icons/Icons';
import { categoryImageUrl } from '../../lib/categoryImages';
import { CategoryTileIcon, categoryTileThemeClass } from './CategoryTileIcon';
import styles from './CategoryTiles.module.css';

const ALL_CATEGORIES_LABEL = 'Все категории';

interface CategoryTilesProps {
  categories: CategoryNode[];
  variant?: 'default' | 'mobile';
}

function sortByOrder(a: CategoryNode, b: CategoryNode) {
  return a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'ru');
}

export function CategoryTiles({ categories, variant = 'default' }: CategoryTilesProps) {
  const roots = categories.filter((c) => !c.parentId).sort(sortByOrder);
  const children = categories.flatMap((c) => c.children).sort(sortByOrder);
  const tiles = variant === 'mobile' ? roots.slice(0, 12) : [...roots, ...children];

  if (tiles.length === 0) return null;

  const showAllCategoriesTile = variant === 'mobile';

  return (
    <div
      className={`${styles.scroll} ${variant === 'mobile' ? styles.scrollMobile : ''}`}
      role="list"
    >
      {showAllCategoriesTile && (
        <Link to="/catalog" className={`${styles.tile} ${styles.tileAll}`} role="listitem">
          <span className={styles.imageBox}>
            <IconCatalog className={styles.catalogIcon} aria-hidden />
          </span>
          <span className={styles.label}>{ALL_CATEGORIES_LABEL}</span>
        </Link>
      )}
      {tiles.map((cat) => (
        <Link
          key={cat.id}
          to={`/catalog?categorySlug=${cat.slug}`}
          className={`${styles.tile} ${variant === 'mobile' ? styles.tileIcon : ''}`}
          role="listitem"
        >
          <span
            className={`${styles.imageBox} ${
              variant === 'mobile' ? `${styles.imageBoxIcon} ${categoryTileThemeClass(cat.slug)}` : ''
            }`}
          >
            {variant === 'mobile' ? (
              <CategoryTileIcon slug={cat.slug} />
            ) : (
              <img
                src={categoryImageUrl(cat.slug)}
                alt=""
                className={styles.image}
                loading="lazy"
              />
            )}
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
