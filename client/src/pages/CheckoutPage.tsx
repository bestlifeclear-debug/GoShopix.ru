import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '@goshopix/shared';
import { ordersApi, productsApi } from '../api';
import type { CartItem } from '../api/types';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../design-system';
import { track } from '../lib/analytics';
import { CDEK_CITY_HINTS, getCdekPickupOptions } from '../lib/cdekPickup';
import { digitsRuPhone, formatRuPhoneDisplay, isRuPhoneComplete } from '../lib/phoneFormat';
import { ApiClientError } from '../api/client';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import styles from './CheckoutPage.module.css';

const FREE_DELIVERY_FROM = 2000;
const DELIVERY_ESTIMATE_POST = 320;
const DELIVERY_ESTIMATE_CDEK = 280;

type PaymentMethodUi = 'card' | 'sbp';
type DeliveryMethodUi = 'post' | 'cdek';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STEPS = ['Корзина', 'Доставка', 'Подтверждение', 'Оплата'] as const;

const COMMENT_SUGGESTIONS = ['Оставить у двери', 'Позвонить перед доставкой', 'Не звонить в домофон'] as const;

function buildItemsPreview(items: CartItem[]) {
  return items.map((it) => ({
    id: it.id,
    name: it.product.name,
    imageUrl: it.product.imageUrl,
    variantName: it.variant.name,
    options: it.variant.options?.map((o) => `${o.name}: ${o.value}`).join(', ') ?? '',
    unitPrice: it.unitPrice,
    quantity: it.quantity,
    stock: it.variant.stock,
    lineTotal: it.lineTotal,
  }));
}

type CheckoutFieldProps = {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  showError: boolean;
  showValid: boolean;
  captureRef?: (el: HTMLDivElement | null) => void;
  children: ReactNode;
};

function CheckoutField({
  id,
  label,
  optional,
  error,
  showError,
  showValid,
  captureRef,
  children,
}: CheckoutFieldProps) {
  return (
    <div className={styles.field} ref={captureRef}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {optional && <span className={styles.optionalTag}>необязательно</span>}
      </label>
      {children}
      {showError && error && <p className={styles.inlineError}>{error}</p>}
      {showValid && <p className={styles.inlineValid} aria-live="polite">Готово</p>}
    </div>
  );
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const cart = useCartStore((s) => s.cart);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const [compareAtByProduct, setCompareAtByProduct] = useState<Record<string, number | null>>({});
  const [loadingPriceMeta, setLoadingPriceMeta] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [payment, setPayment] = useState<PaymentMethodUi>('card');

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethodUi>('post');
  const [postIndex, setPostIndex] = useState('');
  const [postCity, setPostCity] = useState('');
  const [postStreet, setPostStreet] = useState('');
  const [postHouse, setPostHouse] = useState('');
  const [postApartment, setPostApartment] = useState('');

  const [cdekCity, setCdekCity] = useState('');
  const [cdekPickupPointId, setCdekPickupPointId] = useState('');
  const [cdekClientId, setCdekClientId] = useState('');

  const [saveAddress, setSaveAddress] = useState(true);
  const [comment, setComment] = useState('');
  const [agreement, setAgreement] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const firstErrorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!token) {
      navigate('/auth?returnUrl=/checkout');
      return;
    }
    void fetchCart();
  }, [token, fetchCart, navigate]);

  useEffect(() => {
    if (user?.profile) {
      const p = user.profile;
      setName([p.firstName, p.lastName].filter(Boolean).join(' '));
      const rawPhone = p.phone ?? '';
      setPhone(rawPhone ? formatRuPhoneDisplay(rawPhone) : '');
      setEmail(user.email ?? '');
    }
  }, [user]);

  useEffect(() => {
    if (!cart?.items.length) {
      setCompareAtByProduct({});
      return;
    }

    let cancelled = false;
    setLoadingPriceMeta(true);
    void Promise.all(
      cart.items.map(async (item) => {
        const detail = await productsApi.get(item.product.id);
        return { productId: item.product.id, compareAt: detail.compareAtPrice };
      }),
    )
      .then((rows) => {
        if (cancelled) return;
        const map: Record<string, number | null> = {};
        for (const row of rows) map[row.productId] = row.compareAt;
        setCompareAtByProduct(map);
      })
      .catch(() => {
        if (!cancelled) setCompareAtByProduct({});
      })
      .finally(() => {
        if (!cancelled) setLoadingPriceMeta(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cart?.updatedAt, cart?.itemCount, cart?.items.map((i) => `${i.id}:${i.quantity}`).join('|')]);

  const totals = useMemo(() => {
    if (!cart) {
      return {
        originalSubtotal: 0,
        discount: 0,
        subtotal: 0,
        total: 0,
        freeDelivery: false,
      };
    }

    let originalSubtotal = 0;
    for (const item of cart.items) {
      const compareAt = compareAtByProduct[item.product.id];
      const unitOriginal = compareAt != null && compareAt > item.unitPrice ? compareAt : item.unitPrice;
      originalSubtotal += unitOriginal * item.quantity;
    }

    const subtotal = cart.subtotal;
    const discount = Math.max(0, originalSubtotal - subtotal);
    const freeDelivery = subtotal >= FREE_DELIVERY_FROM;

    return {
      originalSubtotal,
      discount,
      subtotal,
      total: subtotal,
      freeDelivery,
    };
  }, [cart, compareAtByProduct]);

  const itemsPreview = useMemo(() => buildItemsPreview(cart?.items ?? []), [cart?.items]);

  useEffect(() => {
    track('checkout_open');
  }, []);

  const isEmpty = cart && cart.items.length === 0;

  const cdekPickupOptions = useMemo(() => getCdekPickupOptions(cdekCity), [cdekCity]);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    if (!name.trim()) e.name = 'Введите ФИО';
    if (!isRuPhoneComplete(phone)) e.phone = 'Введите телефон в формате +7 (999) 000-00-00';
    if (email.trim() && !EMAIL_RE.test(email.trim())) e.email = 'Введите корректный email';

    if (deliveryMethod === 'post') {
      const index = postIndex.replace(/\D/g, '');
      if (index.length !== 5) e.postIndex = 'Индекс должен состоять из 5 цифр';
      if (!postCity.trim()) e.postCity = 'Укажите город';
      if (!postStreet.trim()) e.postStreet = 'Укажите улицу';
      if (!postHouse.trim()) e.postHouse = 'Укажите дом';
    } else {
      if (!cdekCity.trim()) e.cdekCity = 'Укажите город';
      if (cdekPickupOptions.length === 0) e.cdekPickupPointId = 'Нет доступных ПВЗ для выбранного города';
      if (!cdekPickupPointId.trim()) e.cdekPickupPointId = 'Выберите пункт выдачи';
      if (cdekClientId.trim() && !/^\d+$/.test(cdekClientId.trim())) e.cdekClientId = 'Только цифры';
    }

    if (!agreement) e.agreement = 'Нужно согласие с условиями';

    return e;
  }, [
    agreement,
    cdekCity,
    cdekClientId,
    cdekPickupOptions.length,
    cdekPickupPointId,
    deliveryMethod,
    email,
    name,
    phone,
    postCity,
    postHouse,
    postIndex,
    postStreet,
  ]);

  const canSubmit = useMemo(() => {
    if (!cart?.items.length) return false;
    return Object.keys(errors).length === 0;
  }, [cart?.items.length, errors]);

  const stepper = useMemo(() => {
    const cartOk = Boolean(cart?.items.length);
    const deliveryOk =
      deliveryMethod === 'post'
        ? !errors.postIndex && !errors.postCity && !errors.postStreet && !errors.postHouse
        : !errors.cdekCity && !errors.cdekPickupPointId && !errors.cdekClientId;
    const paymentOk = Boolean(payment) && deliveryOk;
    const confirmOk = false;
    return { cartOk, deliveryOk, paymentOk, confirmOk };
  }, [cart?.items.length, deliveryMethod, errors, payment]);

  const activeStep = useMemo(() => {
    if (!stepper.cartOk) return 0;
    if (!stepper.deliveryOk) return 1;
    if (!canSubmit) return 2;
    return 3;
  }, [canSubmit, stepper]);

  const deliveryLineLabel = useMemo(() => {
    if (totals.freeDelivery) return 'Бесплатно';
    if (!stepper.deliveryOk) return 'Укажите адрес доставки';
    const estimate = deliveryMethod === 'post' ? DELIVERY_ESTIMATE_POST : DELIVERY_ESTIMATE_CDEK;
    const carrier = deliveryMethod === 'post' ? 'Почта России' : 'СДЭК';
    return `от ${formatPrice(estimate)} · ${carrier}`;
  }, [deliveryMethod, stepper.deliveryOk, totals.freeDelivery]);

  const markTouched = (key: string) => setTouched((t) => ({ ...t, [key]: true }));
  const showError = (key: string) => Boolean(touched[key] && errors[key]);
  const showValid = (key: string, filled: boolean) => Boolean(touched[key] && filled && !errors[key]);

  const captureFirstError = (key: string) => (el: HTMLDivElement | null) => {
    if (!el) return;
    if (firstErrorRef.current) return;
    if (!showError(key)) return;
    firstErrorRef.current = el;
  };

  const inputClass = (key: string, filled: boolean) =>
    [
      styles.input,
      showError(key) ? styles.inputError : '',
      showValid(key, filled) ? styles.inputValid : '',
    ]
      .filter(Boolean)
      .join(' ');

  const buildShippingAddress = () => {
    if (deliveryMethod === 'post') {
      const index = postIndex.replace(/\D/g, '').slice(0, 5);
      return `Почта России, ${index}, ${postCity}, ${postStreet}, дом ${postHouse}${postApartment.trim() ? `, кв. ${postApartment}` : ''}`;
    }

    const pointLabel = cdekPickupOptions.find((p) => p.id === cdekPickupPointId)?.label ?? cdekPickupPointId;
    const courierHint = cdekClientId.trim() ? `, ID клиента: ${cdekClientId.trim()}` : '';
    return `СДЭК, ${cdekCity}, ${pointLabel}${courierHint}`;
  };

  const validateAll = () => {
    const allKeys = Object.keys(errors);
    if (allKeys.length === 0) return true;
    setTouched((t) => {
      const next = { ...t };
      for (const key of allKeys) next[key] = true;
      return next;
    });
    return false;
  };

  const handlePay = async () => {
    if (!cart?.items.length) return;
    if (!validateAll()) {
      firstErrorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const order = await ordersApi.create({
        shippingName: name,
        shippingPhone: digitsRuPhone(phone),
        shippingAddress: buildShippingAddress(),
        paymentMethod: payment,
        deliveryMethod,
        customerNote: comment.trim() || undefined,
      });

      await fetchCart();

      const { redirectUrl } = await ordersApi.paymentRedirect(order.id, {
        paymentMethod: payment,
        returnUrl: '/checkout/confirmation',
      });

      track('order_complete', { orderId: order.id, paymentMethod: payment, deliveryMethod, saveAddress });

      window.location.href = redirectUrl;
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Не удалось оформить заказ');
    } finally {
      setSubmitting(false);
    }
  };

  const payButtonIcon =
    payment === 'sbp' ? (
      <img src="/payment-icons/sbp.png" alt="" className={styles.payBtnIcon} width={22} height={22} />
    ) : (
      <img src="/payment-icons/mir.png" alt="" className={styles.payBtnIcon} width={28} height={18} />
    );

  if (!token) return null;

  return (
    <PageContainer>
      <div className={styles.page}>
        <header className={styles.head}>
          <div className={styles.headTop}>
            <div>
              <h1 className={styles.title}>Оформление заказа</h1>
              <p className={styles.subtitle}>Доставка и оплата</p>
            </div>
            <Link className={styles.back} to="/cart">
              ← В корзину
            </Link>
          </div>

          <div
            className={styles.stepper}
            aria-label="Прогресс оформления"
            style={{ '--step-progress': `${(activeStep / (STEPS.length - 1)) * 100}%` } as CSSProperties}
          >
            <div className={styles.stepperTrack} aria-hidden />
            {STEPS.map((label, index) => (
              <div
                key={label}
                className={`${styles.step} ${activeStep >= index ? styles.stepDone : ''} ${activeStep === index ? styles.stepCurrent : ''}`}
              >
                <span className={styles.stepDot} aria-hidden />
                <span className={styles.stepLabel}>{label}</span>
              </div>
            ))}
            <p className={styles.stepperHint}>
              Шаг {Math.min(activeStep + 1, STEPS.length)} из {STEPS.length}
            </p>
          </div>
        </header>

        {isEmpty && (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>Корзина пуста</p>
            <p className={styles.emptyHint}>Добавьте товары, чтобы оформить заказ.</p>
            <Link to="/catalog">
              <Button>Перейти в каталог</Button>
            </Link>
          </div>
        )}

        {cart && cart.items.length > 0 && (
          <div className={styles.grid}>
            <div className={styles.left}>
              <section className={styles.block}>
                <div className={styles.blockHead}>
                  <h2 className={styles.blockTitle}>Данные получателя</h2>
                  {user && (
                    <span className={styles.profileBadge}>Из профиля</span>
                  )}
                </div>

                <div className={styles.formGrid}>
                  <CheckoutField
                    id="checkout-name"
                    label="ФИО"
                    error={errors.name}
                    showError={showError('name')}
                    showValid={showValid('name', Boolean(name.trim()))}
                    captureRef={captureFirstError('name')}
                  >
                    <input
                      id="checkout-name"
                      data-testid="checkout-name"
                      className={inputClass('name', Boolean(name.trim()))}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => markTouched('name')}
                      placeholder="Иванов Иван Иванович"
                      autoComplete="name"
                    />
                  </CheckoutField>

                  <CheckoutField
                    id="checkout-phone"
                    label="Телефон"
                    error={errors.phone}
                    showError={showError('phone')}
                    showValid={showValid('phone', isRuPhoneComplete(phone))}
                    captureRef={captureFirstError('phone')}
                  >
                    <input
                      id="checkout-phone"
                      data-testid="checkout-phone"
                      className={inputClass('phone', isRuPhoneComplete(phone))}
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(formatRuPhoneDisplay(e.target.value))}
                      onBlur={() => markTouched('phone')}
                      placeholder="+7 (999) 000-00-00"
                      autoComplete="tel"
                    />
                  </CheckoutField>

                  <CheckoutField
                    id="checkout-email"
                    label="Email"
                    optional
                    error={errors.email}
                    showError={showError('email')}
                    showValid={showValid('email', Boolean(email.trim()) && EMAIL_RE.test(email.trim()))}
                    captureRef={captureFirstError('email')}
                  >
                    <input
                      id="checkout-email"
                      data-testid="checkout-email"
                      className={inputClass('email', Boolean(email.trim()))}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => markTouched('email')}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </CheckoutField>
                </div>
              </section>

              <section className={styles.block}>
                <div className={styles.blockHead}>
                  <h2 className={styles.blockTitle}>Способ доставки</h2>
                </div>

                <div className={styles.choiceRow} role="radiogroup" aria-label="Доставка">
                  <label className={`${styles.choice} ${deliveryMethod === 'cdek' ? styles.choiceActive : ''}`}>
                    <input
                      type="radio"
                      name="delivery"
                      value="cdek"
                      checked={deliveryMethod === 'cdek'}
                      onChange={() => setDeliveryMethod('cdek')}
                    />
                    <span className={styles.choiceBody}>
                      <span className={styles.choiceMain}>СДЭК</span>
                      <span className={styles.choiceEta}>3–5 дней</span>
                    </span>
                  </label>

                  <label className={`${styles.choice} ${deliveryMethod === 'post' ? styles.choiceActive : ''}`}>
                    <input
                      type="radio"
                      name="delivery"
                      value="post"
                      checked={deliveryMethod === 'post'}
                      onChange={() => setDeliveryMethod('post')}
                    />
                    <span className={styles.choiceBody}>
                      <span className={styles.choiceMain}>Почта России</span>
                      <span className={styles.choiceEta}>4–8 дней</span>
                    </span>
                  </label>
                </div>

                <div className={styles.animatedRegion} data-open={deliveryMethod === 'post'}>
                  {deliveryMethod === 'post' && (
                    <div className={styles.formGrid}>
                      <CheckoutField
                        id="post-index"
                        label="Индекс"
                        error={errors.postIndex}
                        showError={showError('postIndex')}
                        showValid={showValid('postIndex', postIndex.replace(/\D/g, '').length === 5)}
                        captureRef={captureFirstError('postIndex')}
                      >
                        <input
                          id="post-index"
                          data-testid="checkout-post-index"
                          className={inputClass('postIndex', postIndex.replace(/\D/g, '').length === 5)}
                          value={postIndex}
                          onChange={(e) => setPostIndex(e.target.value.replace(/[^\d]/g, '').slice(0, 5))}
                          onBlur={() => markTouched('postIndex')}
                          placeholder="101000"
                          inputMode="numeric"
                          autoComplete="postal-code"
                        />
                      </CheckoutField>

                      <CheckoutField
                        id="post-city"
                        label="Город"
                        error={errors.postCity}
                        showError={showError('postCity')}
                        showValid={showValid('postCity', Boolean(postCity.trim()))}
                        captureRef={captureFirstError('postCity')}
                      >
                        <input
                          id="post-city"
                          data-testid="checkout-post-city"
                          className={inputClass('postCity', Boolean(postCity.trim()))}
                          value={postCity}
                          onChange={(e) => setPostCity(e.target.value)}
                          onBlur={() => markTouched('postCity')}
                          placeholder="Москва"
                          autoComplete="address-level2"
                        />
                      </CheckoutField>

                      <CheckoutField
                        id="post-street"
                        label="Улица"
                        error={errors.postStreet}
                        showError={showError('postStreet')}
                        showValid={showValid('postStreet', Boolean(postStreet.trim()))}
                        captureRef={captureFirstError('postStreet')}
                      >
                        <input
                          id="post-street"
                          data-testid="checkout-post-street"
                          className={inputClass('postStreet', Boolean(postStreet.trim()))}
                          value={postStreet}
                          onChange={(e) => setPostStreet(e.target.value)}
                          onBlur={() => markTouched('postStreet')}
                          placeholder="Тверская"
                          autoComplete="street-address"
                        />
                      </CheckoutField>

                      <div className={styles.pairGrid}>
                        <CheckoutField
                          id="post-house"
                          label="Дом"
                          error={errors.postHouse}
                          showError={showError('postHouse')}
                          showValid={showValid('postHouse', Boolean(postHouse.trim()))}
                          captureRef={captureFirstError('postHouse')}
                        >
                          <input
                            id="post-house"
                            data-testid="checkout-post-house"
                            className={inputClass('postHouse', Boolean(postHouse.trim()))}
                            value={postHouse}
                            onChange={(e) => setPostHouse(e.target.value)}
                            onBlur={() => markTouched('postHouse')}
                            placeholder="10"
                          />
                        </CheckoutField>

                        <CheckoutField id="post-apartment" label="Квартира" optional showError={false} showValid={false}>
                          <input
                            id="post-apartment"
                            className={styles.input}
                            value={postApartment}
                            onChange={(e) => setPostApartment(e.target.value)}
                            placeholder="12"
                          />
                        </CheckoutField>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.animatedRegion} data-open={deliveryMethod === 'cdek'}>
                  {deliveryMethod === 'cdek' && (
                    <div className={styles.formGrid}>
                      <CheckoutField
                        id="cdek-city"
                        label="Город"
                        error={errors.cdekCity}
                        showError={showError('cdekCity')}
                        showValid={showValid('cdekCity', Boolean(cdekCity.trim()) && cdekPickupOptions.length > 0)}
                        captureRef={captureFirstError('cdekCity')}
                      >
                        <input
                          id="cdek-city"
                          data-testid="checkout-cdek-city"
                          className={inputClass('cdekCity', Boolean(cdekCity.trim()))}
                          value={cdekCity}
                          onChange={(e) => {
                            setCdekCity(e.target.value);
                            setCdekPickupPointId('');
                          }}
                          onBlur={() => markTouched('cdekCity')}
                          placeholder="Москва"
                          list="cdek-city-list"
                          autoComplete="address-level2"
                        />
                        <datalist id="cdek-city-list">
                          {CDEK_CITY_HINTS.map((city) => (
                            <option key={city} value={city} />
                          ))}
                        </datalist>
                      </CheckoutField>

                      <CheckoutField
                        id="cdek-pvz"
                        label="Пункт выдачи"
                        error={errors.cdekPickupPointId}
                        showError={showError('cdekPickupPointId')}
                        showValid={showValid('cdekPickupPointId', Boolean(cdekPickupPointId))}
                        captureRef={captureFirstError('cdekPickupPointId')}
                      >
                        <select
                          id="cdek-pvz"
                          data-testid="checkout-cdek-pvz"
                          className={`${styles.select} ${showError('cdekPickupPointId') ? styles.inputError : ''} ${showValid('cdekPickupPointId', Boolean(cdekPickupPointId)) ? styles.inputValid : ''}`}
                          value={cdekPickupPointId}
                          onChange={(e) => setCdekPickupPointId(e.target.value)}
                          onBlur={() => markTouched('cdekPickupPointId')}
                          required
                          disabled={cdekPickupOptions.length === 0}
                        >
                          <option value="">
                            {cdekPickupOptions.length ? 'Выберите пункт выдачи' : 'Нет пунктов для города'}
                          </option>
                          {cdekPickupOptions.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                      </CheckoutField>

                      <CheckoutField
                        id="cdek-client-id"
                        label="ID клиента СДЭК"
                        optional
                        error={errors.cdekClientId}
                        showError={showError('cdekClientId')}
                        showValid={showValid('cdekClientId', Boolean(cdekClientId.trim()) && !errors.cdekClientId)}
                      >
                        <input
                          id="cdek-client-id"
                          className={inputClass('cdekClientId', Boolean(cdekClientId.trim()))}
                          value={cdekClientId}
                          onChange={(e) => setCdekClientId(e.target.value.replace(/[^\d]/g, '').slice(0, 16))}
                          onBlur={() => markTouched('cdekClientId')}
                          placeholder="Для курьерской доставки"
                          inputMode="numeric"
                        />
                      </CheckoutField>

                      <label className={styles.checkbox}>
                        <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
                        <span>Сохранить адрес для следующих заказов</span>
                      </label>
                    </div>
                  )}
                </div>
              </section>

              <section
                className={`${styles.block} ${styles.blockPayment} ${!stepper.deliveryOk ? styles.blockLocked : ''}`}
                aria-disabled={!stepper.deliveryOk}
              >
                <div className={styles.blockHead}>
                  <h2 className={styles.blockTitle}>Способ оплаты</h2>
                </div>

                {!stepper.deliveryOk && (
                  <p className={styles.blockLockHint}>Сначала заполните данные доставки — блок оплаты откроется автоматически.</p>
                )}

                <div className={styles.choiceRow} role="radiogroup" aria-label="Оплата">
                  <label className={`${styles.choice} ${payment === 'card' ? styles.choiceActive : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={payment === 'card'}
                      onChange={() => setPayment('card')}
                      disabled={!stepper.deliveryOk}
                    />
                    <img src="/payment-icons/mir.png" alt="" className={styles.choiceLogo} width={44} height={28} />
                    <span className={styles.choiceBody}>
                      <span className={styles.choiceMain}>Банковская карта</span>
                      <span className={styles.choiceMeta}>МИР</span>
                    </span>
                  </label>
                  <label className={`${styles.choice} ${payment === 'sbp' ? styles.choiceActive : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="sbp"
                      checked={payment === 'sbp'}
                      onChange={() => setPayment('sbp')}
                      disabled={!stepper.deliveryOk}
                    />
                    <img src="/payment-icons/sbp.png" alt="" className={styles.choiceLogo} width={40} height={40} />
                    <span className={styles.choiceBody}>
                      <span className={styles.choiceMain}>СБП</span>
                      <span className={styles.choiceMeta}>QR-Код / Приложение банка</span>
                    </span>
                  </label>
                </div>

              </section>

              <section className={styles.block}>
                <div className={styles.blockHead}>
                  <h2 className={styles.blockTitle}>Комментарий</h2>
                </div>
                <div className={styles.commentHints} aria-label="Примеры комментариев">
                  {COMMENT_SUGGESTIONS.map((hint) => (
                    <button
                      key={hint}
                      type="button"
                      className={styles.commentChip}
                      onClick={() => setComment(hint)}
                    >
                      {hint}
                    </button>
                  ))}
                </div>
                <textarea
                  className={styles.textarea}
                  data-testid="checkout-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, 220))}
                  placeholder="Пожелания к доставке (необязательно)"
                  rows={2}
                />
              </section>
            </div>

            <aside className={styles.right}>
              <div className={styles.summaryCard}>
                <h2 className={styles.summaryTitle}>Ваш заказ</h2>

                <div className={styles.itemsList} aria-label="Товары в заказе">
                  {itemsPreview.map((it) => (
                    <div key={it.id} className={styles.item}>
                      <div className={styles.itemThumb} aria-hidden>
                        {it.imageUrl ? <img src={it.imageUrl} alt="" /> : <span className={styles.itemThumbPh} />}
                      </div>
                      <div className={styles.itemBody}>
                        <div className={styles.itemName}>{it.name}</div>
                        {it.variantName && <div className={styles.itemMeta}>{it.variantName}</div>}
                        {it.options && <div className={styles.itemMeta}>{it.options}</div>}
                        <div className={styles.itemBottom}>
                          <div className={styles.qty}>
                            <button
                              type="button"
                              onClick={() => void updateQuantity(it.id, Math.max(1, it.quantity - 1))}
                              aria-label="Уменьшить количество"
                            >
                              −
                            </button>
                            <span>{it.quantity}</span>
                            <button
                              type="button"
                              onClick={() => void updateQuantity(it.id, it.quantity + 1)}
                              aria-label="Увеличить количество"
                              disabled={it.quantity >= it.stock}
                            >
                              +
                            </button>
                          </div>
                          <div className={styles.itemPrice}>{formatPrice(it.lineTotal)}</div>
                        </div>
                        <button type="button" className={styles.itemRemove} onClick={() => void removeItem(it.id)}>
                          Удалить
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.summaryDivider} aria-hidden />

                <div className={styles.totals}>
                  <div className={styles.totalRow}>
                    <span>Товары</span>
                    <strong>{formatPrice(totals.originalSubtotal)}</strong>
                  </div>
                  {totals.discount > 0 && (
                    <div className={`${styles.totalRow} ${styles.totalRowSale}`}>
                      <span>Скидка</span>
                      <strong>−{formatPrice(totals.discount)}</strong>
                    </div>
                  )}
                  <div className={styles.totalRow} data-testid="checkout-delivery-line">
                    <span>Доставка</span>
                    <strong className={styles.deliveryValue}>{deliveryLineLabel}</strong>
                  </div>
                  <div className={styles.totalPay}>
                    <span>Итого к оплате</span>
                    <strong className={styles.totalAmount}>{formatPrice(totals.total)}</strong>
                  </div>
                </div>

                <Button
                  size="lg"
                  fullWidth
                  leftIcon={payButtonIcon}
                  onClick={handlePay}
                  disabled={submitting || !canSubmit || loadingPriceMeta}
                  data-testid="checkout-submit"
                >
                  {submitting ? 'Переходим…' : payment === 'sbp' ? 'Перейти к оплате (СБП)' : 'Перейти к оплате (карта)'}
                </Button>
                <p className={styles.payHint}>
                  <img src="/payment-icons/yookassa.png" alt="" className={styles.payHintLogo} width={72} height={16} />
                  Оплата происходит безопасно через платёжный сервис.
                </p>

                <div className={styles.agreeWrap} ref={captureFirstError('agreement')}>
                  <label className={`${styles.checkbox} ${showError('agreement') ? styles.checkboxError : ''}`}>
                    <input
                      type="checkbox"
                      data-testid="checkout-agreement"
                      checked={agreement}
                      onChange={(e) => setAgreement(e.target.checked)}
                      onBlur={() => markTouched('agreement')}
                    />
                    <span>
                      Согласен с условиями покупки и обработкой данных.{' '}
                      <Link to="/privacy" className={styles.inlineLink}>
                        Политика
                      </Link>
                    </span>
                  </label>
                  {showError('agreement') && <p className={styles.inlineError}>{errors.agreement}</p>}
                </div>

                {error && (
                  <p className={styles.globalError} role="alert">
                    {error}
                  </p>
                )}

                <div className={styles.trust} aria-label="Доверие">
                  <div className={styles.trustItem}>SSL</div>
                  <div className={styles.trustItem}>Возврат 14 дней</div>
                  <div className={styles.trustItem}>Поддержка</div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
