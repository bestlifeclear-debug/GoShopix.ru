import { useEffect, useRef, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { formatPrice } from '@goshopix/shared';
import styles from './CheckoutModal.module.css';

export type PaymentMethodUi = 'card' | 'sbp';
export type DeliveryMethodUi = 'post' | 'cdek';

export interface CheckoutItemPreview {
  name: string;
  quantity: number;
}

export interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  name: string;
  phone: string;
  payment: PaymentMethodUi;
  deliveryMethod: DeliveryMethodUi;
  postIndex: string;
  postAddress: string;
  cdekCity: string;
  cdekPickupPoint: string;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onPaymentChange: (value: PaymentMethodUi) => void;
  onDeliveryMethodChange: (value: DeliveryMethodUi) => void;
  onPostIndexChange: (value: string) => void;
  onPostAddressChange: (value: string) => void;
  onCdekCityChange: (value: string) => void;
  onCdekPickupPointChange: (value: string) => void;
  total: number;
  itemCount: number;
  originalSubtotal: number;
  discount: number;
  freeDelivery: boolean;
  freeDeliveryFrom: number;
  items: CheckoutItemPreview[];
  error: string | null;
  submitting: boolean;
}

export function CheckoutModal({
  open,
  onClose,
  onSubmit,
  name,
  phone,
  payment,
  deliveryMethod,
  postIndex,
  postAddress,
  cdekCity,
  cdekPickupPoint,
  onNameChange,
  onPhoneChange,
  onPaymentChange,
  onDeliveryMethodChange,
  onPostIndexChange,
  onPostAddressChange,
  onCdekCityChange,
  onCdekPickupPointChange,
  total,
  itemCount,
  originalSubtotal,
  discount,
  freeDelivery,
  freeDeliveryFrom,
  items,
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

              {deliveryMethod === 'post' && (
                <>
                  <label className={styles.field}>
                    <span className={styles.label}>Индекс (Почта России)</span>
                    <input
                      className={styles.input}
                      value={postIndex}
                      onChange={(e) => onPostIndexChange(e.target.value)}
                      placeholder="Например: 101000"
                      inputMode="numeric"
                      required
                      autoComplete="postal-code"
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.label}>Адрес доставки</span>
                    <input
                      className={styles.input}
                      value={postAddress}
                      onChange={(e) => onPostAddressChange(e.target.value)}
                      placeholder="Город, улица, дом, квартира"
                      required
                      autoComplete="street-address"
                    />
                  </label>
                </>
              )}

              {deliveryMethod === 'cdek' && (
                <>
                  <label className={styles.field}>
                    <span className={styles.label}>Город (СДЭК)</span>
                    <input
                      className={styles.input}
                      value={cdekCity}
                      onChange={(e) => onCdekCityChange(e.target.value)}
                      placeholder="Например: Москва"
                      required
                      autoComplete="address-level2"
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.label}>Пункт выдачи СДЭК</span>
                    <input
                      className={styles.input}
                      value={cdekPickupPoint}
                      onChange={(e) => onCdekPickupPointChange(e.target.value)}
                      placeholder="Адрес ПВЗ или код"
                      required
                    />
                  </label>
                </>
              )}

              <div className={styles.trustUnderAddress} aria-label="Безопасная оплата">
                <span className={styles.trustCaption}>Безопасная оплата</span>
                <div className={styles.trustIconsRow}>
                  <div className={styles.trustIconCell}>
                    <img src="/payment-icons/yookassa.png" alt="" width={88} height={28} />
                  </div>
                  <div className={styles.trustIconCell}>
                    <img src="/payment-icons/mir.png" alt="" width={56} height={28} />
                  </div>
                  <div className={styles.trustIconCell}>
                    <img src="/payment-icons/sbp.png" alt="" width={56} height={28} />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.rightCol}>
              <div className={styles.summaryCard}>
                <h3 className={styles.summaryTitle}>Ваш заказ</h3>
                <p className={styles.summaryTotal}>{formatPrice(total)}</p>
                <p className={styles.summaryMeta}>
                  {itemCount} {itemCount === 1 ? 'товар' : itemCount < 5 ? 'товара' : 'товаров'} ·{' '}
                  {freeDelivery ? 'доставка бесплатно' : `бесплатно от ${formatPrice(freeDeliveryFrom)}`}
                </p>
                {items.length > 0 && (
                  <div className={styles.itemsPreview} aria-label="Состав заказа">
                    {items.slice(0, 3).map((it) => (
                      <div key={`${it.name}-${it.quantity}`} className={styles.itemPreviewRow}>
                        <span className={styles.itemPreviewName}>{it.name}</span>
                        <strong className={styles.itemPreviewQty}>×{it.quantity}</strong>
                      </div>
                    ))}
                    {items.length > 3 && (
                      <p className={styles.itemsPreviewMore}>и ещё {items.length - 3}</p>
                    )}
                  </div>
                )}
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
                    className={`${styles.paymentOption} ${payment === 'sbp' ? styles.paymentOptionActive : ''}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="sbp"
                      checked={payment === 'sbp'}
                      onChange={() => onPaymentChange('sbp')}
                    />
                    СБП
                  </label>
                </fieldset>
              </div>

              <div className={styles.deliveryBlock}>
                <span className={styles.label}>Способ доставки</span>
                <fieldset className={styles.paymentOptions}>
                  <label
                    className={`${styles.paymentOption} ${deliveryMethod === 'post' ? styles.paymentOptionActive : ''}`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value="post"
                      checked={deliveryMethod === 'post'}
                      onChange={() => onDeliveryMethodChange('post')}
                    />
                    Почта России
                  </label>
                  <label
                    className={`${styles.paymentOption} ${deliveryMethod === 'cdek' ? styles.paymentOptionActive : ''}`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value="cdek"
                      checked={deliveryMethod === 'cdek'}
                      onChange={() => onDeliveryMethodChange('cdek')}
                    />
                    СДЭК
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
