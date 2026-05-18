import { useEffect, useId, useRef, useState } from 'react';
import { COUNTRIES, DEFAULT_COUNTRY, formatPhoneDigits, type CountryOption } from './countries';
import styles from './PhoneField.module.css';

export interface PhoneFieldProps {
  label?: string;
  value: string;
  country: CountryOption;
  onValueChange: (digits: string) => void;
  onCountryChange: (country: CountryOption) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  id?: string;
  'data-testid'?: string;
  onBlur?: () => void;
  compact?: boolean;
}

export function PhoneField({
  label = 'Номер телефона',
  value,
  country,
  onValueChange,
  onCountryChange,
  error,
  hint,
  required,
  id: idProp,
  'data-testid': testId,
  onBlur,
  compact = false,
}: PhoneFieldProps) {
  const uid = useId();
  const inputId = idProp ?? `phone-${uid}`;
  const errorId = `${inputId}-error`;
  const listId = `${inputId}-countries`;
  const wrapRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.dial.includes(query) ||
      c.code.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  const selectCountry = (c: CountryOption) => {
    onCountryChange(c);
    setOpen(false);
    setQuery('');
  };

  const onCountryKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    }
    if (e.key === 'Enter' && filtered[activeIndex]) {
      e.preventDefault();
      selectCountry(filtered[activeIndex]);
    }
  };

  const hasError = Boolean(error);

  return (
    <div className={`${styles.field} ${compact ? styles.compact : ''}`}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      <div ref={wrapRef} className={`${styles.row} ${hasError ? styles.hasError : ''}`}>
        <div className={styles.countryWrap}>
          <button
            type="button"
            className={styles.countryBtn}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-controls={listId}
            onClick={() => setOpen((o) => !o)}
            onKeyDown={onCountryKeyDown}
          >
            <span className={styles.flag} aria-hidden>
              {country.flag}
            </span>
            <span className={styles.dial}>{country.dial}</span>
            <span className={styles.chevron} aria-hidden>
              ▼
            </span>
          </button>
          {open && (
            <div className={styles.dropdown} role="presentation">
              <input
                type="search"
                className={styles.search}
                placeholder="Поиск страны..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Поиск страны"
                autoFocus
              />
              <ul id={listId} className={styles.list} role="listbox" aria-label="Страна">
                {(filtered.length ? filtered : [DEFAULT_COUNTRY]).map((c, i) => (
                  <li key={c.code} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={c.code === country.code}
                      className={`${styles.option} ${i === activeIndex ? styles.optionActive : ''}`}
                      onClick={() => selectCountry(c)}
                    >
                      <span aria-hidden>{c.flag}</span>
                      <span>{c.name}</span>
                      <span className={styles.optionDial}>{c.dial}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <input
          id={inputId}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          className={styles.input}
          placeholder="(999) 123-45-67"
          value={value}
          required={required}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          data-testid={testId}
          onChange={(e) => onValueChange(formatPhoneDigits(e.target.value))}
          onBlur={onBlur}
        />
      </div>
      {(error || hint) && (
        <p
          id={hasError ? errorId : undefined}
          className={`${styles.message} ${hasError ? styles.errorMessage : ''}`}
          role={hasError ? 'alert' : undefined}
          aria-live={hasError ? 'polite' : undefined}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
