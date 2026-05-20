import { useCallback, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import type { CategoryNode } from '../../api/types';
import styles from './CatalogAccordion.module.css';

interface CatalogAccordionProps {
  categories: CategoryNode[];
  onClose: () => void;
}

export function CatalogAccordion({ categories, onClose }: CatalogAccordionProps) {
  const baseId = useId();
  const roots = categories.filter((c) => !c.parentId);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  const toggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  if (roots.length === 0) return null;

  return (
    <div className={styles.accordion} role="navigation" aria-label="Категории каталога">
      {roots.map((root) => {
        const isOpen = expanded.has(root.id);
        const panelId = `${baseId}-${root.id}`;

        return (
          <div key={root.id} className={styles.item}>
            <button
              type="button"
              className={styles.trigger}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(root.id)}
            >
              <span className={styles.triggerLabel}>{root.name}</span>
              <span className={styles.chevron} aria-hidden>
                {isOpen ? '−' : '+'}
              </span>
            </button>
            {isOpen && (
              <div id={panelId} className={styles.panel} role="region" aria-label={root.name}>
                {root.children.map((child) => (
                  <Link
                    key={child.id}
                    to={`/catalog?categorySlug=${child.slug}`}
                    className={styles.childLink}
                    onClick={onClose}
                  >
                    {child.name}
                  </Link>
                ))}
                <Link
                  to={`/catalog?categorySlug=${root.slug}`}
                  className={styles.allInRoot}
                  onClick={onClose}
                >
                  Все в «{root.name}»
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
