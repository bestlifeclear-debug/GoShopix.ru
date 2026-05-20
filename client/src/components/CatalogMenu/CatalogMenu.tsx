import { useMemo, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import type { CategoryNode } from '../../api/types';
import { categoryImageUrl } from '../../lib/categoryImages';
import styles from './CatalogMenu.module.css';

const MAX_COLUMNS = 4;
const MAX_SUBLINKS = 7;

interface CatalogMenuProps {
  categories: CategoryNode[];
  onClose: () => void;
}

export function CatalogMenu({ categories, onClose }: CatalogMenuProps) {
  const roots = useMemo(() => categories.filter((c) => !c.parentId).slice(0, MAX_COLUMNS), [categories]);
  const promoRoot = roots[0];

  if (roots.length === 0) return null;

  return (
    <div
      className={styles.panel}
      role="dialog"
      aria-label="Каталог товаров"
      id="catalog-mega-menu"
    >
      <div className={styles.mega}>
        <div
          className={styles.columns}
          style={{ '--mega-cols': roots.length } as CSSProperties}
        >
          {roots.map((root) => (
            <div key={root.id} className={styles.column}>
              <Link
                to={`/catalog?categorySlug=${root.slug}`}
                className={styles.columnTitle}
                onClick={onClose}
              >
                {root.name}
              </Link>
              {root.children.length > 0 ? (
                <ul className={styles.subList}>
                  {root.children.slice(0, MAX_SUBLINKS).map((child) => (
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
              ) : (
                <p className={styles.subEmpty}>Популярные товары раздела</p>
              )}
              <Link
                to={`/catalog?categorySlug=${root.slug}`}
                className={styles.seeAll}
                onClick={onClose}
              >
                Все в «{root.name}»
              </Link>
            </div>
          ))}
        </div>

        {promoRoot && (
          <aside className={styles.promo} aria-label="Рекомендуемый раздел">
            <Link
              to={`/catalog?categorySlug=${promoRoot.slug}`}
              className={styles.promoCard}
              onClick={onClose}
            >
              <img
                src={categoryImageUrl(promoRoot.slug)}
                alt=""
                className={styles.promoImage}
                loading="lazy"
                decoding="async"
                width={240}
                height={200}
              />
              <span className={styles.promoBadge}>Акция</span>
              <span className={styles.promoTitle}>{promoRoot.name}</span>
              <span className={styles.promoCta}>Смотреть →</span>
            </Link>
          </aside>
        )}
      </div>

      <footer className={styles.footer}>
        <Link to="/catalog" className={styles.allCatalog} onClick={onClose}>
          Весь каталог
        </Link>
      </footer>
    </div>
  );
}
