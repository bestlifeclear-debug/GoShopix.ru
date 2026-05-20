import { useEffect, useRef, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { formatPrice } from '@goshopix/shared';
import styles from './CheckoutModal.module.css';

export interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  name: string;
  phone: string;
  address: string;
  payment: string;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onPaymentChange: (value: string) => void;
  total: number;
  itemCount: number;
  originalSubtotal: number;
  discount: number;
  freeDelivery: boolean;
  freeDeliveryFrom: number;
  error: string | null;
  submitting: boolean;
}

export function CheckoutModal({
  open,
  onClose,
  onSubmit,
  name,
  phone,
  address,
  payment,
  onNameChange,
  onPhoneChange,
  onAddressChange,
  onPaymentChange,
  total,
  itemCount,
  originalSubtotal,
  discount,
  freeDelivery,
  freeDeliveryFrom,
  error,
  submitting,
}: CheckoutModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
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
  }, [open, onClose, submitting]);

  if (!open) return null;

  return createPortal(
    <div className={styles.overlay} role="presentation" onClick={() => !submitting && onClose()}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-modal-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 id="checkout-modal-title" className={styles.title}>
            Оформление заказа
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            disabled={submitting}
            aria-label="Закрыть"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </header>

        <form id="cart-checkout-form" className={styles.body} onSubmit={onSubmit}>
          <div className={styles.grid}>
            <div className={styles.leftCol}>
              <label className={styles.field}>
                <span className={styles.label}>ФИО</span>
                <input
                  className={styles.input}
                  value={name}
                  onChange={(e) => onNameChange(e.target.value)}
                  placeholder="Иванов Иван Иванович"
                  required
                  autoComplete="name"
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Телефон</span>
                <input
                  className={styles.input}
                  type="tel"
                  value={phone}
                  onChange={(e) => onPhoneChange(e.target.value)}
                  placeholder="+7 (999) 000-00-00"
                  required
                  autoComplete="tel"
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Адрес доставки</span>
                <input
                  className={styles.input}
                  value={address}
                  onChange={(e) => onAddressChange(e.target.value)}
                  placeholder="Город, улица, дом, квартира"
                  required
                  autoComplete="street-address"
                />
              </label>
            </div>

            <div className={styles.rightCol}>
              <div className={styles.summaryCard}>
                <h3 className={styles.summaryTitle}>Ваш заказ</h3>
                <p className={styles.summaryTotal}>{formatPrice(total)}</p>
                <p className={styles.summaryMeta}>
                  {itemCount} {itemCount === 1 ? 'товар' : itemCount < 5 ? 'товара' : 'товаров'} ·{' '}
                  {freeDelivery ? 'доставка бесплатно' : `бесплатно от ${formatPrice(freeDeliveryFrom)}`}
                </p>
                <div className={styles.summaryRow}>
                  <span>Товары</span>
                  <strong>{formatPrice(originalSubtotal)}</strong>
                </div>
                {discount > 0 && (
                  <div className={`${styles.summaryRow} ${styles.summaryRowSale}`}>
                    <span>Скидка</span>
                    <strong>−{formatPrice(discount)}</strong>
                  </div>
                )}
                <div className={styles.summaryRow}>
                  <span>Доставка</span>
                  <strong>{freeDelivery ? 'Бесплатно' : 'При оформлении'}</strong>
                </div>
              </div>

              <div className={styles.paymentBlock}>
                <span className={styles.label}>Способ оплаты</span>
                <fieldset className={styles.paymentOptions}>
                  <label
                    className={`${styles.paymentOption} ${payment === 'card' ? styles.paymentOptionActive : ''}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={payment === 'card'}
                      onChange={() => onPaymentChange('card')}
                    />
                    Банковская карта
                  </label>
                  <label
                    className={`${styles.paymentOption} ${payment === 'cash' ? styles.paymentOptionActive : ''}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={payment === 'cash'}
                      onChange={() => onPaymentChange('cash')}
                    />
                    При получении
                  </label>
                </fieldset>
              </div>
            </div>
          </div>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
        </form>

        <footer className={styles.footer}>
          <div className={styles.trustBlock} aria-label="Безопасная оплата">
            <div className={styles.trustIcons}>
              <img src="/payment-icons/yookassa.png" alt="ЮKassa" width={72} height={24} />
              <img src="/payment-icons/mir.png" alt="Мир" width={48} height={24} />
              <img src="/payment-icons/sbp.png" alt="СБП" width={48} height={24} />
            </div>
            <span className={styles.trustText}>Безопасная оплата</span>
          </div>
          <div className={styles.footerActions}>
          <button type="button" className={styles.btnCancel} onClick={onClose} disabled={submitting}>
            Отмена
          </button>
          <button
            type="submit"
            form="cart-checkout-form"
            className={styles.btnSubmit}
            disabled={submitting}
          >
            {submitting ? 'Оформляем…' : 'Оформить заказ'}
          </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
