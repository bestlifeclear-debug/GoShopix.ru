import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../../design-system';
import { IconClose } from '../../design-system/icons/Icons';
import styles from './CatalogMobileFilters.module.css';

interface CatalogMobileFiltersProps {
  open: boolean;
  onClose: () => void;
  onReset?: () => void;
  hasActiveFilters: boolean;
  totalCount: number;
  loading: boolean;
  resultsLabel: string;
  children: React.ReactNode;
}

export function CatalogMobileFilters({
  open,
  onClose,
  onReset,
  hasActiveFilters,
  totalCount,
  loading,
  resultsLabel,
  children,
}: CatalogMobileFiltersProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className={styles.root} role="dialog" aria-modal="true" aria-labelledby="catalog-filters-title">
      <header className={styles.header}>
        <h2 id="catalog-filters-title" className={styles.title}>
          Фильтры
        </h2>
        <div className={styles.headerActions}>
          {hasActiveFilters && onReset && (
            <button type="button" className={styles.resetBtn} onClick={onReset}>
              Сбросить
            </button>
          )}
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Закрыть фильтры">
            <IconClose />
          </button>
        </div>
      </header>

      <div className={styles.body}>{children}</div>

      <footer className={styles.footer}>
        <Button type="button" className={styles.applyBtn} onClick={onClose}>
          {loading ? 'Загрузка…' : `Показать ${totalCount} ${resultsLabel}`}
        </Button>
      </footer>
    </div>,
    document.body,
  );
}
