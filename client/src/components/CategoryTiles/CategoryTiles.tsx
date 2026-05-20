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
  const tiles = variant === 'mobile' ? roots.slice(0, 8) : [...roots, ...children];

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
