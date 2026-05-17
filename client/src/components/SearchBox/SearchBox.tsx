import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconSearch } from '../../design-system/icons/Icons';
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
  suggestions?: SearchSuggestion[];
  placeholder?: string;
  className?: string;
  compact?: boolean;
  hideSubmit?: boolean;
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
  suggestions = [],
  placeholder = 'Искать товары, бренды, категории',
  className,
  compact,
  hideSubmit,
}: SearchBoxProps) {
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>(() => loadRecent());

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
          placeholder={placeholder}
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
        <button type="button" className={styles.submit} onClick={handleSubmit}>
          <span className={styles.submitText}>Найти</span>
          <IconSearch className={styles.submitIcon} aria-hidden />
        </button>
      </div>

      {showPanel && (
        <div id={listId} className={styles.panel} role="listbox">
          {showHints && (
            <>
              {recent.length > 0 && (
                <>
                  <p className={styles.panelTitle}>Недавние</p>
                  <ul className={styles.hintList}>
                    {recent.map((hint) => (
                      <li key={`recent-${hint}`}>
                        <button
                          type="button"
                          className={styles.hintBtn}
                          role="option"
                          onClick={() => {
                            onChange(hint);
                            setOpen(false);
                          }}
                        >
                          {hint}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <p className={styles.panelTitle}>Популярные запросы</p>
              <ul className={styles.hintList}>
                {DEFAULT_HINTS.map((hint) => (
                  <li key={hint}>
                    <button
                      type="button"
                      className={styles.hintBtn}
                      role="option"
                      onClick={() => {
                        onChange(hint);
                        setOpen(false);
                      }}
                    >
                      <IconSearch />
                      {hint}
                    </button>
                  </li>
                ))}
              </ul>
            </>
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
