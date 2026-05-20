import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { CategoryNode } from '../../api/types';
import { categoryImageUrl } from '../../lib/categoryImages';
import styles from './CatalogMenu.module.css';

interface CatalogMenuProps {
  categories: CategoryNode[];
  onClose: () => void;
}

export function CatalogMenu({ categories, onClose }: CatalogMenuProps) {
  const roots = useMemo(() => categories.filter((c) => !c.parentId), [categories]);
  const [activeRootId, setActiveRootId] = useState<string | null>(() => roots[0]?.id ?? null);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);

  const activeRoot = roots.find((r) => r.id === activeRootId) ?? roots[0];
  const activeChild =
    activeRoot?.children.find((c) => c.id === activeChildId) ?? activeRoot?.children[0];

  const grandchildren = activeChild?.children ?? [];

  return (
    <div className={styles.panel} role="dialog" aria-label="Каталог товаров">
      <div className={styles.mega}>
        <nav className={styles.colRoots} aria-label="Разделы каталога">
          {roots.map((root) => (
            <Link
              key={root.id}
              to={`/catalog?categorySlug=${root.slug}`}
              className={`${styles.rootItem} ${activeRoot?.id === root.id ? styles.rootItemActive : ''}`}
              onMouseEnter={() => {
                setActiveRootId(root.id);
                setActiveChildId(root.children[0]?.id ?? null);
              }}
              onFocus={() => {
                setActiveRootId(root.id);
                setActiveChildId(root.children[0]?.id ?? null);
              }}
              onClick={onClose}
            >
              <img
                src={categoryImageUrl(root.slug)}
                alt=""
                className={styles.thumb}
              />
              {root.name}
            </Link>
          ))}
        </nav>

        {activeRoot && activeRoot.children.length > 0 && (
          <nav className={styles.colChildren} aria-label={`Подкатегории: ${activeRoot.name}`}>
            {activeRoot.children.map((child) => (
              <Link
                key={child.id}
                to={`/catalog?categorySlug=${child.slug}`}
                className={`${styles.childItem} ${activeChild?.id === child.id ? styles.childItemActive : ''}`}
                onMouseEnter={() => setActiveChildId(child.id)}
                onFocus={() => setActiveChildId(child.id)}
                onClick={onClose}
              >
                {child.name}
              </Link>
            ))}
          </nav>
        )}

        <div className={styles.colGrand}>
          {activeChild ? (
            <>
              <Link
                to={`/catalog?categorySlug=${activeChild.slug}`}
                className={styles.grandTitle}
                onClick={onClose}
              >
                Все в «{activeChild.name}»
              </Link>
              {grandchildren.length > 0 ? (
                <ul className={styles.grandList}>
                  {grandchildren.map((g) => (
                    <li key={g.id}>
                      <Link
                        to={`/catalog?categorySlug=${g.slug}`}
                        className={styles.grandLink}
                        onClick={onClose}
                      >
                        {g.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.grandHint}>
                  Популярные товары в категории «{activeChild.name}» — смотрите в каталоге.
                </p>
              )}
            </>
          ) : (
            activeRoot && (
              <Link
                to={`/catalog?categorySlug=${activeRoot.slug}`}
                className={styles.grandTitle}
                onClick={onClose}
              >
                Все в «{activeRoot.name}»
              </Link>
            )
          )}
        </div>
      </div>

      <Link to="/catalog" className={styles.allLink} onClick={onClose}>
        Весь каталог →
      </Link>
    </div>
  );
}
