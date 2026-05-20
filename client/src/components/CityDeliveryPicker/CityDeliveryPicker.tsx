import { useCallback, useEffect, useRef, useState } from 'react';
import { cityDeliveryApi } from '../../api';
import { ApiClientError } from '../../api/client';
import {
  DELIVERY_CITY_CHANGED_EVENT,
  readStoredDeliveryCity,
  writeStoredDeliveryCity,
} from '../../lib/deliveryCityStorage';
import styles from './CityDeliveryPicker.module.css';

const DEFAULT_CITY = 'Москва';

export function CityDeliveryPicker() {
  const [label, setLabel] = useState(() => readStoredDeliveryCity()?.city ?? DEFAULT_CITY);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [indexDraft, setIndexDraft] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => setLabel(readStoredDeliveryCity()?.city ?? DEFAULT_CITY);
    window.addEventListener('storage', sync);
    window.addEventListener(DELIVERY_CITY_CHANGED_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(DELIVERY_CITY_CHANGED_EVENT, sync);
    };
  }, []);

  useEffect(() => {
    if (readStoredDeliveryCity()) return;
    const run = async () => {
      try {
        const d = await cityDeliveryApi.detect();
        const city = d.city?.trim() || DEFAULT_CITY;
        const r = await cityDeliveryApi.check({ city });
        if (r.is_available) {
          writeStoredDeliveryCity({
            city: r.city,
            checkedAt: Date.now(),
            delivery_services: r.delivery_services,
            ...(r.cdek_pickup_points ? { cdek_pickup_points: r.cdek_pickup_points } : {}),
          });
          setLabel(r.city);
        }
      } catch {
        /* ignore */
      }
    };
    void run();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const runSuggest = useCallback((q: string) => {
    if (q.length < 3) {
      setSuggestions([]);
      return;
    }
    void cityDeliveryApi
      .suggestions(q)
      .then((r) => setSuggestions(r.suggestions))
      .catch(() => setSuggestions([]));
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => runSuggest(draft), 200);
    return () => clearTimeout(t);
  }, [draft, open, runSuggest]);

  const pickCity = async (cityName: string) => {
    const trimmed = cityName.trim();
    if (trimmed.length < 2) return;
    const indexDigits = indexDraft.replace(/\D/g, '').slice(0, 5);
    setLoading(true);
    try {
      const r = await cityDeliveryApi.check({
        city: trimmed,
        ...(indexDigits.length === 5 ? { index: indexDigits } : {}),
      });
      if (!r.is_available) {
        window.alert(
          'В выбранном городе не найдено подходящих пунктов СДЭК или отделений Почты России. Попробуйте другой населённый пункт или уточните индекс.',
        );
        return;
      }
      writeStoredDeliveryCity({
        city: r.city,
        checkedAt: Date.now(),
        delivery_services: r.delivery_services,
        ...(indexDigits.length === 5 ? { index: indexDigits } : {}),
        ...(r.cdek_pickup_points ? { cdek_pickup_points: r.cdek_pickup_points } : {}),
      });
      setLabel(r.city);
      setOpen(false);
      setDraft('');
      setIndexDraft('');
      setSuggestions([]);
    } catch (e) {
      const msg = e instanceof ApiClientError ? e.message : 'Не удалось проверить город';
      window.alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <span className={styles.prefix}>Доставка в</span>
      {!open ? (
        <button
          type="button"
          className={styles.trigger}
          onClick={() => {
            setOpen(true);
            setDraft(label);
            setIndexDraft(readStoredDeliveryCity()?.index ?? '');
          }}
          aria-haspopup="listbox"
          aria-expanded={open}
          title="Нажмите, чтобы выбрать город доставки"
        >
          {label}
        </button>
      ) : (
        <div className={styles.dropdown}>
          <input
            className={styles.input}
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setOpen(false);
              if (e.key === 'Enter' && draft.trim().length >= 2) {
                e.preventDefault();
                void pickCity(draft.trim());
              }
            }}
            placeholder="Минимум 3 буквы для подсказок"
            aria-autocomplete="list"
            aria-controls="city-suggest-list"
            disabled={loading}
          />
          <input
            className={styles.indexInput}
            value={indexDraft}
            onChange={(e) => setIndexDraft(e.target.value.replace(/[^\d]/g, '').slice(0, 5))}
            placeholder="Индекс (необязательно)"
            inputMode="numeric"
            aria-label="Почтовый индекс"
            disabled={loading}
          />
          {suggestions.length > 0 && (
            <ul id="city-suggest-list" className={styles.list} role="listbox">
              {suggestions.map((s) => (
                <li key={s}>
                  <button type="button" className={styles.option} role="option" onClick={() => void pickCity(s)}>
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            className={styles.apply}
            disabled={loading || draft.trim().length < 2}
            onClick={() => void pickCity(draft.trim())}
          >
            {loading ? 'Проверка…' : 'Применить'}
          </button>
        </div>
      )}
    </div>
  );
}
