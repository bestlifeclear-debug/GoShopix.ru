import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '@goshopix/shared';
import { ordersApi, productsApi } from '../api';
import type { CartItem } from '../api/types';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../design-system';
import { track } from '../lib/analytics';
import { ApiClientError } from '../api/client';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import styles from './CheckoutPage.module.css';

const FREE_DELIVERY_FROM = 2000;

type PaymentMethodUi = 'card' | 'sbp';
type DeliveryMethodUi = 'post' | 'cdek';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CDEK_PICKUP_POINTS: Record<string, { id: string; label: string }[]> = {
  москва: [
    { id: 'MSK-001', label: 'ПВЗ СДЭК · Тверская, 10' },
    { id: 'MSK-002', label: 'ПВЗ СДЭК · Ленинградский пр-т, 27' },
    { id: 'MSK-003', label: 'ПВЗ СДЭК · Варшавское ш., 87' },
  ],
  'санкт-петербург': [
    { id: 'SPB-001', label: 'ПВЗ СДЭК · Невский пр-т, 114' },
    { id: 'SPB-002', label: 'ПВЗ СДЭК · Лиговский пр-т, 50' },
  ],
  новосибирск: [
    { id: 'NSK-001', label: 'ПВЗ СДЭК · Красный пр-т, 25' },
    { id: 'NSK-002', label: 'ПВЗ СДЭК · ул. Гоголя, 33' },
  ],
};

function normalizeCity(value: string) {
  return value.trim().toLowerCase();
}

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
  const [buyerMode, setBuyerMode] = useState<'new' | 'login'>('new');

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
      setPhone(p.phone ?? '');
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

  const cdekPickupOptions = useMemo(() => {
    const key = normalizeCity(cdekCity);
    return CDEK_PICKUP_POINTS[key] ?? [];
  }, [cdekCity]);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    if (!name.trim()) e.name = 'Введите ФИО';
    if (!phone.trim() || phone.trim().length < 5) e.phone = 'Введите телефон';
    if (!email.trim() || !EMAIL_RE.test(email.trim())) e.email = 'Введите корректный email';

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
    const paymentOk = Boolean(payment);
    const confirmOk = false;
    return { cartOk, deliveryOk, paymentOk, confirmOk };
  }, [cart?.items.length, deliveryMethod, errors, payment]);

  const activeStep = useMemo(() => {
    if (!stepper.cartOk) return 0;
    if (!stepper.deliveryOk) return 1;
    if (!stepper.paymentOk) return 2;
    return 3;
  }, [stepper]);

  const markTouched = (key: string) => setTouched((t) => ({ ...t, [key]: true }));
  const showError = (key: string) => Boolean(touched[key] && errors[key]);
  const captureFirstError = (key: string) => (el: HTMLDivElement | null) => {
    if (!el) return;
    if (firstErrorRef.current) return;
    if (!showError(key)) return;
    firstErrorRef.current = el;
  };

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
        shippingPhone: phone,
        shippingAddress: buildShippingAddress(),
        paymentMethod: payment,
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

  if (!token) return null;

  return (
    <PageContainer>
      <div className={styles.page}>
        <header className={styles.head}>
          <div className={styles.headTop}>
            <div>
              <h1 className={styles.title}>Оформление заказа</h1>
              <p className={styles.subtitle}>Доставка и оплата — как в крупных маркетплейсах.</p>
            </div>
            <Link className={styles.back} to="/cart">
              ← В корзину
            </Link>
          </div>

          <div className={styles.stepper} aria-label="Прогресс оформления">
            <div className={`${styles.step} ${activeStep >= 0 ? styles.stepDone : ''}`}>
              <span className={styles.stepDot} aria-hidden />
              <span className={styles.stepLabel}>Корзина</span>
            </div>
            <div className={`${styles.step} ${activeStep >= 1 ? styles.stepDone : ''}`}>
              <span className={styles.stepDot} aria-hidden />
              <span className={styles.stepLabel}>Доставка</span>
            </div>
            <div className={`${styles.step} ${activeStep >= 2 ? styles.stepDone : ''}`}>
              <span className={styles.stepDot} aria-hidden />
              <span className={styles.stepLabel}>Оплата</span>
            </div>
            <div className={styles.step}>
              <span className={styles.stepDot} aria-hidden />
              <span className={styles.stepLabel}>Подтверждение</span>
            </div>
            <div className={styles.stepLine} aria-hidden />
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
                  <div className={styles.segment} role="tablist" aria-label="Режим покупателя">
                    <button
                      type="button"
                      className={`${styles.segmentBtn} ${buyerMode === 'new' ? styles.segmentBtnActive : ''}`}
                      onClick={() => setBuyerMode('new')}
                      role="tab"
                      aria-selected={buyerMode === 'new'}
                    >
                      Я новый покупатель
                    </button>
                    <button
                      type="button"
                      className={`${styles.segmentBtn} ${buyerMode === 'login' ? styles.segmentBtnActive : ''}`}
                      onClick={() => setBuyerMode('login')}
                      role="tab"
                      aria-selected={buyerMode === 'login'}
                    >
                      Войти
                    </button>
                  </div>
                </div>

                {buyerMode === 'login' && (
                  <div className={styles.callout}>
                    <p className={styles.calloutText}>Войдите, чтобы подтянуть данные и историю заказов.</p>
                    <Link className={styles.calloutLink} to="/auth?returnUrl=/checkout">
                      Перейти к входу →
                    </Link>
                  </div>
                )}

                <div className={styles.formGrid}>
                  <div className={styles.field} ref={captureFirstError('name')}>
                    <label className={styles.label} htmlFor="checkout-name">
                      ФИО
                    </label>
                    <input
                      id="checkout-name"
                      className={`${styles.input} ${showError('name') ? styles.inputError : ''}`}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => markTouched('name')}
                      placeholder="Иванов Иван Иванович"
                      autoComplete="name"
                    />
                    {showError('name') && <p className={styles.inlineError}>{errors.name}</p>}
                  </div>

                  <div className={styles.field} ref={captureFirstError('phone')}>
                    <label className={styles.label} htmlFor="checkout-phone">
                      Телефон
                    </label>
                    <input
                      id="checkout-phone"
                      className={`${styles.input} ${showError('phone') ? styles.inputError : ''}`}
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onBlur={() => markTouched('phone')}
                      placeholder="+7 (999) 000-00-00"
                      autoComplete="tel"
                    />
                    {showError('phone') && <p className={styles.inlineError}>{errors.phone}</p>}
                  </div>

                  <div className={styles.field} ref={captureFirstError('email')}>
                    <label className={styles.label} htmlFor="checkout-email">
                      Email
                    </label>
                    <input
                      id="checkout-email"
                      className={`${styles.input} ${showError('email') ? styles.inputError : ''}`}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => markTouched('email')}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                    {showError('email') && <p className={styles.inlineError}>{errors.email}</p>}
                  </div>
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
                    <span className={styles.choiceMain}>СДЭК</span>
                    <span className={styles.choiceMeta}>3–5 дней</span>
                  </label>

                  <label className={`${styles.choice} ${deliveryMethod === 'post' ? styles.choiceActive : ''}`}>
                    <input
                      type="radio"
                      name="delivery"
                      value="post"
                      checked={deliveryMethod === 'post'}
                      onChange={() => setDeliveryMethod('post')}
                    />
                    <span className={styles.choiceMain}>Почта России</span>
                    <span className={styles.choiceMeta}>4–8 дней</span>
                  </label>
                </div>

                <div className={styles.animatedRegion} data-open={deliveryMethod === 'post'}>
                  {deliveryMethod === 'post' && (
                    <div className={styles.formGrid}>
                      <div className={styles.field} ref={captureFirstError('postIndex')}>
                        <label className={styles.label} htmlFor="post-index">
                          Индекс
                        </label>
                        <input
                          id="post-index"
                          className={`${styles.input} ${showError('postIndex') ? styles.inputError : ''}`}
                          value={postIndex}
                          onChange={(e) => setPostIndex(e.target.value.replace(/[^\d]/g, '').slice(0, 5))}
                          onBlur={() => markTouched('postIndex')}
                          placeholder="10100"
                          inputMode="numeric"
                          autoComplete="postal-code"
                        />
                        {showError('postIndex') && <p className={styles.inlineError}>{errors.postIndex}</p>}
                      </div>

                      <div className={styles.field} ref={captureFirstError('postCity')}>
                        <label className={styles.label} htmlFor="post-city">
                          Город
                        </label>
                        <input
                          id="post-city"
                          className={`${styles.input} ${showError('postCity') ? styles.inputError : ''}`}
                          value={postCity}
                          onChange={(e) => setPostCity(e.target.value)}
                          onBlur={() => markTouched('postCity')}
                          placeholder="Москва"
                          autoComplete="address-level2"
                        />
                        {showError('postCity') && <p className={styles.inlineError}>{errors.postCity}</p>}
                      </div>

                      <div className={styles.field} ref={captureFirstError('postStreet')}>
                        <label className={styles.label} htmlFor="post-street">
                          Улица
                        </label>
                        <input
                          id="post-street"
                          className={`${styles.input} ${showError('postStreet') ? styles.inputError : ''}`}
                          value={postStreet}
                          onChange={(e) => setPostStreet(e.target.value)}
                          onBlur={() => markTouched('postStreet')}
                          placeholder="Тверская"
                          autoComplete="street-address"
                        />
                        {showError('postStreet') && <p className={styles.inlineError}>{errors.postStreet}</p>}
                      </div>

                      <div className={styles.row2}>
                        <div className={styles.field} ref={captureFirstError('postHouse')}>
                          <label className={styles.label} htmlFor="post-house">
                            Дом
                          </label>
                          <input
                            id="post-house"
                            className={`${styles.input} ${showError('postHouse') ? styles.inputError : ''}`}
                            value={postHouse}
                            onChange={(e) => setPostHouse(e.target.value)}
                            onBlur={() => markTouched('postHouse')}
                            placeholder="10"
                          />
                          {showError('postHouse') && <p className={styles.inlineError}>{errors.postHouse}</p>}
                        </div>

                        <div className={styles.field}>
                          <label className={styles.label} htmlFor="post-apartment">
                            Квартира (необязательно)
                          </label>
                          <input
                            id="post-apartment"
                            className={styles.input}
                            value={postApartment}
                            onChange={(e) => setPostApartment(e.target.value)}
                            placeholder="12"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.animatedRegion} data-open={deliveryMethod === 'cdek'}>
                  {deliveryMethod === 'cdek' && (
                    <div className={styles.formGrid}>
                      <div className={styles.field} ref={captureFirstError('cdekCity')}>
                        <label className={styles.label} htmlFor="cdek-city">
                          Город
                        </label>
                        <input
                          id="cdek-city"
                          className={`${styles.input} ${showError('cdekCity') ? styles.inputError : ''}`}
                          value={cdekCity}
                          onChange={(e) => {
                            setCdekCity(e.target.value);
                            setCdekPickupPointId('');
                          }}
                          onBlur={() => markTouched('cdekCity')}
                          placeholder="Москва"
                          autoComplete="address-level2"
                        />
                        {showError('cdekCity') && <p className={styles.inlineError}>{errors.cdekCity}</p>}
                      </div>

                      <div className={styles.field} ref={captureFirstError('cdekPickupPointId')}>
                        <label className={styles.label} htmlFor="cdek-pvz">
                          Пункт выдачи
                        </label>
                        <select
                          id="cdek-pvz"
                          className={`${styles.select} ${showError('cdekPickupPointId') ? styles.inputError : ''}`}
                          value={cdekPickupPointId}
                          onChange={(e) => setCdekPickupPointId(e.target.value)}
                          onBlur={() => markTouched('cdekPickupPointId')}
                          required
                          disabled={cdekPickupOptions.length === 0}
                        >
                          <option value="">{cdekPickupOptions.length ? 'Выберите пункт выдачи' : 'Нет пунктов для города'}</option>
                          {cdekPickupOptions.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                        {showError('cdekPickupPointId') && <p className={styles.inlineError}>{errors.cdekPickupPointId}</p>}
                      </div>

                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="cdek-client-id">
                          ID клиента СДЭК (необязательно)
                        </label>
                        <input
                          id="cdek-client-id"
                          className={`${styles.input} ${showError('cdekClientId') ? styles.inputError : ''}`}
                          value={cdekClientId}
                          onChange={(e) => setCdekClientId(e.target.value.replace(/[^\d]/g, '').slice(0, 16))}
                          onBlur={() => markTouched('cdekClientId')}
                          placeholder="Например: 123456"
                          inputMode="numeric"
                        />
                        {showError('cdekClientId') && <p className={styles.inlineError}>{errors.cdekClientId}</p>}
                      </div>

                      <label className={styles.checkbox}>
                        <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
                        <span>Сохранить адрес для следующих заказов</span>
                      </label>
                    </div>
                  )}
                </div>
              </section>

              <section className={styles.block}>
                <div className={styles.blockHead}>
                  <h2 className={styles.blockTitle}>Способ оплаты</h2>
                </div>

                <div className={styles.choiceRow} role="radiogroup" aria-label="Оплата">
                  <label className={`${styles.choice} ${payment === 'card' ? styles.choiceActive : ''}`}>
                    <input type="radio" name="payment" value="card" checked={payment === 'card'} onChange={() => setPayment('card')} />
                    <span className={styles.choiceMain}>Банковская карта</span>
                    <span className={styles.choiceMeta}>Visa/Mir</span>
                  </label>
                  <label className={`${styles.choice} ${payment === 'sbp' ? styles.choiceActive : ''}`}>
                    <input type="radio" name="payment" value="sbp" checked={payment === 'sbp'} onChange={() => setPayment('sbp')} />
                    <span className={styles.choiceMain}>СБП</span>
                    <span className={styles.choiceMeta}>QR / приложение банка</span>
                  </label>
                </div>

                <p className={styles.hint}>
                  Данные карты на сайте не вводятся — после подтверждения заказа вы перейдёте на платёжный шлюз.
                </p>
              </section>

              <section className={styles.block}>
                <div className={styles.blockHead}>
                  <h2 className={styles.blockTitle}>Комментарий</h2>
                </div>
                <textarea
                  className={styles.textarea}
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

                <div className={styles.promo}>
                  <input className={styles.promoInput} placeholder="Промокод" />
                  <button type="button" className={styles.promoBtn}>
                    Применить
                  </button>
                </div>

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
                  <div className={styles.totalRow}>
                    <span>Доставка</span>
                    <strong>{totals.freeDelivery ? 'Бесплатно' : 'При оформлении'}</strong>
                  </div>
                  <div className={styles.totalPay}>
                    <span>Итого к оплате</span>
                    <strong>{formatPrice(totals.total)}</strong>
                  </div>
                </div>

                <Button
                  size="lg"
                  fullWidth
                  onClick={handlePay}
                  disabled={submitting || !canSubmit || loadingPriceMeta}
                >
                  {submitting ? 'Переходим…' : payment === 'sbp' ? 'Перейти к оплате (СБП)' : 'Перейти к оплате (карта)'}
                </Button>
                <p className={styles.payHint}>Оплата происходит безопасно через платёжный сервис.</p>

                <div
                  className={styles.agreeWrap}
                  ref={captureFirstError('agreement')}
                >
                  <label className={`${styles.checkbox} ${showError('agreement') ? styles.checkboxError : ''}`}>
                    <input type="checkbox" checked={agreement} onChange={(e) => setAgreement(e.target.checked)} onBlur={() => markTouched('agreement')} />
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

