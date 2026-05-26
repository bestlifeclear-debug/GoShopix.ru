import { type FormEvent, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import {
  formatCdekAddress,
  formatPostAddress,
  type SavedAddress,
  type SavedAddressDelivery,
} from '../../lib/savedAddresses';
import { readDeliveryCity } from '../../lib/deliveryCity';
import styles from './AddressFormModal.module.css';

export type AddressFormValues = {
  label: string;
  deliveryMethod: SavedAddressDelivery;
  city: string;
  index: string;
  street: string;
  house: string;
  apartment: string;
  pickupPoint: string;
  isDefault: boolean;
};

const LABEL_PRESETS = ['Дом', 'Работа', 'Другое'];

function emptyForm(): AddressFormValues {
  return {
    label: 'Дом',
    deliveryMethod: 'post',
    city: readDeliveryCity() ?? 'Москва',
    index: '',
    street: '',
    house: '',
    apartment: '',
    pickupPoint: '',
    isDefault: false,
  };
}

function fromAddress(addr: SavedAddress): AddressFormValues {
  return {
    label: addr.label,
    deliveryMethod: addr.deliveryMethod,
    city: addr.city,
    index: addr.index ?? '',
    street: addr.street ?? '',
    house: addr.house ?? '',
    apartment: addr.apartment ?? '',
    pickupPoint: addr.pickupPoint ?? '',
    isDefault: addr.isDefault,
  };
}

function isFormValid(values: AddressFormValues): boolean {
  const labelOk =
    values.label === 'Дом' ||
    values.label === 'Работа' ||
    (values.label !== 'Другое' && values.label.trim().length >= 2);
  if (!labelOk || !values.city.trim()) return false;
  if (values.deliveryMethod === 'post') {
    return (
      values.index.replace(/\D/g, '').length >= 5 &&
      values.street.trim().length >= 2 &&
      values.house.trim().length >= 1
    );
  }
  return values.pickupPoint.trim().length >= 3;
}

interface AddressFormModalProps {
  open: boolean;
  editing: SavedAddress | null;
  onClose: () => void;
  onSave: (values: AddressFormValues, editingId: string | null) => void;
}

export function AddressFormModal({ open, editing, onClose, onSave }: AddressFormModalProps) {
  const [values, setValues] = useState<AddressFormValues>(emptyForm);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const valid = isFormValid(values);

  useEffect(() => {
    if (!open) return;
    setValues(editing ? fromAddress(editing) : emptyForm());
  }, [open, editing]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');
    document.addEventListener('keydown', onKeyDown);
    dialogRef.current?.focus();
    return () => {
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    onSave(values, editing?.id ?? null);
  };

  if (!open) return null;

  const set = <K extends keyof AddressFormValues>(key: K, value: AddressFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const preview =
    values.deliveryMethod === 'post'
      ? formatPostAddress({
          index: values.index,
          city: values.city,
          street: values.street,
          house: values.house,
          apartment: values.apartment,
        })
      : formatCdekAddress({ city: values.city, pickupPoint: values.pickupPoint });

  return createPortal(
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <p id={titleId} className={styles.title}>
            {editing ? 'Редактировать адрес' : 'Новый адрес'}
          </p>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
            <X size={20} strokeWidth={2} aria-hidden />
          </button>
        </header>

        <form className={styles.formWrap} onSubmit={handleSubmit}>
          <div className={styles.body}>
            <div className={styles.form}>
              <div className={styles.field}>
                <span className={styles.label}>Способ доставки</span>
                <div className={styles.methodTabs} role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={values.deliveryMethod === 'post'}
                    className={`${styles.methodTab} ${values.deliveryMethod === 'post' ? styles.methodTabActive : ''}`}
                    onClick={() => set('deliveryMethod', 'post')}
                  >
                    Почта / курьер
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={values.deliveryMethod === 'cdek'}
                    className={`${styles.methodTab} ${values.deliveryMethod === 'cdek' ? styles.methodTabActive : ''}`}
                    onClick={() => set('deliveryMethod', 'cdek')}
                  >
                    СДЭК
                  </button>
                </div>
              </div>

              <label className={styles.field}>
                <span className={styles.label}>Название</span>
                <select
                  className={`${styles.control} ${styles.select}`}
                  value={
                    values.label === 'Дом' || values.label === 'Работа' ? values.label : 'Другое'
                  }
                  onChange={(e) => {
                    const v = e.target.value;
                    set('label', v === 'Другое' ? 'Другое' : v);
                  }}
                >
                  {LABEL_PRESETS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
                {values.label !== 'Дом' && values.label !== 'Работа' ? (
                  <input
                    className={styles.control}
                    placeholder="Например: Дача"
                    value={values.label === 'Другое' ? '' : values.label}
                    onChange={(e) => set('label', e.target.value.trim() || 'Другое')}
                  />
                ) : null}
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Город</span>
                <input
                  className={styles.control}
                  value={values.city}
                  onChange={(e) => set('city', e.target.value)}
                  placeholder="Барнаул"
                />
              </label>

              {values.deliveryMethod === 'post' ? (
                <>
                  <label className={styles.field}>
                    <span className={styles.label}>Индекс</span>
                    <input
                      className={styles.control}
                      inputMode="numeric"
                      value={values.index}
                      onChange={(e) => set('index', e.target.value)}
                      placeholder="656000"
                    />
                  </label>
                  <label className={styles.field}>
                    <span className={styles.label}>Улица</span>
                    <input
                      className={styles.control}
                      value={values.street}
                      onChange={(e) => set('street', e.target.value)}
                      placeholder="пр. Ленина"
                    />
                  </label>
                  <div className={styles.row2}>
                    <label className={styles.field}>
                      <span className={styles.label}>Дом</span>
                      <input
                        className={styles.control}
                        value={values.house}
                        onChange={(e) => set('house', e.target.value)}
                        placeholder="12"
                      />
                    </label>
                    <label className={styles.field}>
                      <span className={styles.label}>Квартира</span>
                      <input
                        className={styles.control}
                        value={values.apartment}
                        onChange={(e) => set('apartment', e.target.value)}
                        placeholder="45"
                      />
                    </label>
                  </div>
                </>
              ) : (
                <label className={styles.field}>
                  <span className={styles.label}>Пункт выдачи СДЭК</span>
                  <input
                    className={styles.control}
                    value={values.pickupPoint}
                    onChange={(e) => set('pickupPoint', e.target.value)}
                    placeholder="Барнаул-3, ул. Павловский тракт, 188"
                  />
                </label>
              )}

              <label className={styles.field}>
                <span className={styles.label}>
                  <input
                    type="checkbox"
                    checked={values.isDefault}
                    onChange={(e) => set('isDefault', e.target.checked)}
                  />{' '}
                  Использовать по умолчанию
                </span>
              </label>

              {valid ? (
                <p className={styles.label} style={{ fontWeight: 400, color: '#6b7280', margin: 0 }}>
                  {preview}
                </p>
              ) : null}
            </div>
          </div>

          <footer className={styles.footer}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={!valid}>
              Сохранить
            </button>
          </footer>
        </form>
      </div>
    </div>,
    document.body,
  );
}
