import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MEGA_MENU_CATEGORIES } from './catalogMegaMenuData';
import styles from './CatalogMenu.module.css';

interface CatalogMenuProps {
  onClose: () => void;
}

export function CatalogMenu({ onClose }: CatalogMenuProps) {
  const [activeId, setActiveId] = useState(MEGA_MENU_CATEGORIES[0]?.id ?? '');
  const activeCategory =
    MEGA_MENU_CATEGORIES.find((c) => c.id === activeId) ?? MEGA_MENU_CATEGORIES[0];

  return (
    <div className={styles.panel} role="dialog" aria-label="Каталог товаров">
      <div className={styles.mega}>
        <nav className={styles.sidebar} aria-label="Главные категории">
          <ul className={styles.sidebarList}>
            {MEGA_MENU_CATEGORIES.map((category) => {
              const isActive = activeCategory?.id === category.id;
              return (
                <li key={category.id}>
                  <Link
                    to={`/catalog?categorySlug=${category.slug}`}
                    className={`${styles.sidebarItem} ${isActive ? styles.sidebarItemActive : ''}`}
                    onMouseEnter={() => setActiveId(category.id)}
                    onFocus={() => setActiveId(category.id)}
                    onClick={onClose}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    {category.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.content} aria-live="polite">
          {activeCategory && (
            <>
              <div className={styles.contentHead}>
                <h3 className={styles.contentTitle}>{activeCategory.name}</h3>
                <Link
                  to={`/catalog?categorySlug=${activeCategory.slug}`}
                  className={styles.contentAll}
                  onClick={onClose}
                >
                  Все товары →
                </Link>
              </div>
              <div className={styles.grid}>
                {activeCategory.columns.map((column) => (
                  <div key={column.title} className={styles.gridCol}>
                    <h4 className={styles.colTitle}>{column.title}</h4>
                    <ul className={styles.colList}>
                      {column.links.map((link) => (
                        <li key={link.slug}>
                          <Link
                            to={`/catalog?categorySlug=${link.slug}`}
                            className={styles.colLink}
                            onClick={onClose}
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className={styles.footer}>
        <Link to="/catalog" className={styles.footerLink} onClick={onClose}>
          Весь каталог →
        </Link>
      </div>
    </div>
  );
}
