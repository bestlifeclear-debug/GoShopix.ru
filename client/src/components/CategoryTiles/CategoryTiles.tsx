import { Link } from 'react-router-dom';
import type { CategoryNode } from '../../api/types';
import styles from './CategoryTiles.module.css';

const TILE_IMAGES: Record<string, string> = {
  electronics: '/product-images/gophone-x-1.svg',
  clothing: '/product-images/urban-wind-jacket-1.svg',
  smartphones: '/product-images/gophone-x-1.svg',
  laptops: '/product-images/probook-15-1.svg',
};

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
              src={TILE_IMAGES[cat.slug] ?? '/product-images/soundwave-pro-1.svg'}
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
