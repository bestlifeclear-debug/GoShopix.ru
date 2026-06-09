import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconCamera, IconHistory, IconMic, IconSearch } from '../../design-system/icons/Icons';
import styles from './SearchBox.module.css';

export interface SearchSuggestion {
  id: string;
  label: string;
  to: string;
  meta?: string;
}

const DEFAULT_HINTS = ['Смартфон', 'Ноутбук', 'Куртка', 'Наушники', 'Кроссовки'];

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  /** Сразу перейти к поиску по подсказке (обходит задержку setState) */
  onHintPick?: (hint: string) => void;
  suggestions?: SearchSuggestion[];
  placeholder?: string;
  className?: string;
  compact?: boolean;
  hideSubmit?: boolean;
  /** Иконки голосового и визуального поиска (мобилка) */
  showMobileActions?: boolean;
  onVisualSearch?: () => void;
}

const RECENT_KEY = 'goshopix-recent-searches';
const MAX_RECENT = 5;

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]).slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function saveRecent(query: string) {
  const q = query.trim();
  if (!q) return;
  const next = [q, ...loadRecent().filter((x) => x !== q)].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

export function SearchBox({
  value,
  onChange,
  onSubmit,
  onHintPick,
  suggestions = [],
  placeholder = 'Искать товары, бренды, категории',
  className,
  compact,
  hideSubmit,
  showMobileActions = true,
  onVisualSearch,
}: SearchBoxProps) {
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>(() => loadRecent());
  const [resolvedPlaceholder, setResolvedPlaceholder] = useState(placeholder);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const sync = () => {
      setResolvedPlaceholder(mq.matches ? 'Поиск товаров и брендов' : placeholder);
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [placeholder]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const showPanel = open && (suggestions.length > 0 || value.length === 0);
  const showHints = open && value.length === 0;
  const showResults = open && value.length > 0 && suggestions.length > 0;

  const handleSubmit = () => {
    if (value.trim()) {
      saveRecent(value.trim());
      setRecent(loadRecent());
    }
    setOpen(false);
    onSubmit();
  };

  const pickHint = (hint: string) => {
    saveRecent(hint);
    setRecent(loadRecent());
    onChange(hint);
    setOpen(false);
    if (onHintPick) {
      onHintPick(hint);
    } else {
      onSubmit();
    }
  };

  const clearRecent = () => {
    localStorage.removeItem(RECENT_KEY);
    setRecent([]);
  };

  return (
    <div
      ref={wrapRef}
      className={`${styles.wrap} ${compact ? styles.compact : ''} ${hideSubmit ? styles.hideSubmit : ''} ${className ?? ''}`}
    >
      <div className={styles.field}>
        <span className={styles.icon} aria-hidden>
          <IconSearch />
        </span>
        <input
          type="search"
          className={styles.input}
          placeholder={resolvedPlaceholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmit();
            }
            if (e.key === 'Escape') setOpen(false);
          }}
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label="Поиск"
        />
        {showMobileActions ? (
          <div className={styles.mobileActions} aria-hidden={false}>
            <button
              type="button"
              className={styles.mobileActionBtn}
              aria-label="Голосовой поиск"
              onClick={() => wrapRef.current?.querySelector('input')?.focus()}
            >
              <IconMic />
            </button>
            <button
              type="button"
              className={styles.mobileActionBtn}
              aria-label="Поиск по фото"
              onClick={onVisualSearch}
            >
              <IconCamera />
            </button>
          </div>
        ) : null}
        <button type="button" className={styles.submit} onClick={handleSubmit}>
          <span className={styles.submitText}>Найти</span>
          <IconSearch className={styles.submitIcon} aria-hidden />
        </button>
      </div>

      {showPanel && (
        <div id={listId} className={styles.panel} role="listbox">
          {showHints && (
            <div className={styles.hintsBody}>
              {recent.length > 0 && (
                <section className={styles.panelSection}>
                  <div className={styles.panelSectionHead}>
                    <p className={styles.panelTitle}>Недавние</p>
                    <button type="button" className={styles.clearRecent} onClick={clearRecent}>
                      Очистить
                    </button>
                  </div>
                  <ul className={styles.hintList}>
                    {recent.map((hint) => (
                      <li key={`recent-${hint}`}>
                        <button
                          type="button"
                          className={styles.hintBtn}
                          role="option"
                          onClick={() => pickHint(hint)}
                        >
                          <span className={`${styles.hintIcon} ${styles.hintIconMuted}`}>
                            <IconHistory />
                          </span>
                          <span className={styles.hintLabel}>{hint}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              <section className={styles.panelSection}>
                <p className={styles.panelTitle}>Популярные запросы</p>
                <ul className={styles.hintList}>
                  {DEFAULT_HINTS.map((hint) => (
                    <li key={hint}>
                      <button
                        type="button"
                        className={styles.hintBtn}
                        role="option"
                        onClick={() => pickHint(hint)}
                      >
                        <span className={styles.hintIcon}>
                          <IconSearch />
                        </span>
                        <span className={styles.hintLabel}>{hint}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}
          {showResults && (
            <>
              <p className={styles.panelTitle}>Товары</p>
              <ul className={styles.resultList}>
                {suggestions.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={item.to}
                      className={styles.resultLink}
                      role="option"
                      onClick={() => setOpen(false)}
                    >
                      <span className={styles.resultLabel}>{item.label}</span>
                      {item.meta && <span className={styles.resultMeta}>{item.meta}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
              <button type="button" className={styles.showAll} onClick={handleSubmit}>
                Все результаты по запросу «{value}»
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
