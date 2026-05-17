import { Link } from 'react-router-dom';
import type { CategoryNode } from '../../api/types';
import styles from './CatalogMenu.module.css';

const CATEGORY_IMAGES: Record<string, string> = {
  electronics: '/product-images/gophone-x-1.svg',
  clothing: '/product-images/urban-wind-jacket-1.svg',
  smartphones: '/product-images/gophone-x-1.svg',
  laptops: '/product-images/probook-15-1.svg',
};

interface CatalogMenuProps {
  categories: CategoryNode[];
  onClose: () => void;
}

export function CatalogMenu({ categories, onClose }: CatalogMenuProps) {
  const roots = categories.filter((c) => !c.parentId);

  return (
    <div className={styles.panel} role="dialog" aria-label="Каталог товаров">
      <div className={styles.grid}>
        {roots.map((root) => (
          <div key={root.id} className={styles.col}>
            <Link
              to={`/catalog?categorySlug=${root.slug}`}
              className={styles.rootLink}
              onClick={onClose}
            >
              <img
                src={CATEGORY_IMAGES[root.slug] ?? '/product-images/soundwave-pro-1.svg'}
                alt=""
                className={styles.thumb}
              />
              {root.name}
            </Link>
            {root.children.length > 0 && (
              <ul className={styles.subList}>
                {root.children.map((child) => (
                  <li key={child.id}>
                    <Link
                      to={`/catalog?categorySlug=${child.slug}`}
                      className={styles.subLink}
                      onClick={onClose}
                    >
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      <Link to="/catalog" className={styles.allLink} onClick={onClose}>
        Весь каталог →
      </Link>
    </div>
  );
}
