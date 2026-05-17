import { Link } from 'react-router-dom';
import type { CategoryNode } from '../../api/types';
import styles from './CategoryShowcase.module.css';

const CATEGORY_IMAGES: Record<string, string> = {
  electronics: '/product-images/gophone-x-1.svg',
  clothing: '/product-images/urban-wind-jacket-1.svg',
  smartphones: '/product-images/gophone-x-1.svg',
  laptops: '/product-images/probook-15-1.svg',
};

interface CategoryShowcaseProps {
  categories: CategoryNode[];
}

export function CategoryShowcase({ categories }: CategoryShowcaseProps) {
  const roots = categories.filter((c) => !c.parentId);

  if (roots.length === 0) return null;

  return (
    <div className={styles.grid}>
      {roots.map((cat) => {
        const image = CATEGORY_IMAGES[cat.slug] ?? '/product-images/soundwave-pro-1.svg';

        return (
          <article key={cat.id} className={styles.card}>
            <Link to={`/catalog?categorySlug=${cat.slug}`} className={styles.hero}>
              <div className={styles.imageWrap}>
                <img src={image} alt="" className={styles.image} />
              </div>
              <div className={styles.heroText}>
                <h3 className={styles.name}>{cat.name}</h3>
                {cat.children.length > 0 && (
                  <p className={styles.meta}>{cat.children.length} подкатегории</p>
                )}
                <span className={styles.cta}>Смотреть →</span>
              </div>
            </Link>
            {cat.children.length > 0 && (
              <div className={styles.children}>
                {cat.children.map((child) => (
                  <Link
                    key={child.id}
                    to={`/catalog?categorySlug=${child.slug}`}
                    className={styles.chip}
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
