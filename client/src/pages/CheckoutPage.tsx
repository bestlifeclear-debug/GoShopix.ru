import { useEffect, useMemo, useState } from 'react';
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
import { orderShortId } from './account/utils';
import styles from './CheckoutPage.module.css';

const FREE_DELIVERY_FROM = 2000;

type PaymentMethodUi = 'card' | 'sbp';
type DeliveryMethodUi = 'post' | 'cdek';

function buildItemsPreview(items: CartItem[]) {
  return items.map((it) => ({ name: it.product.name, quantity: it.quantity }));
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const cart = useCartStore((s) => s.cart);
  const fetchCart = useCartStore((s) => s.fetchCart);

  const [compareAtByProduct, setCompareAtByProduct] = useState<Record<string, number | null>>({});
  const [loadingPriceMeta, setLoadingPriceMeta] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [payment, setPayment] = useState<PaymentMethodUi>('card');

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethodUi>('post');
  const [postIndex, setPostIndex] = useState('');
  const [postAddress, setPostAddress] = useState('');
  const [cdekCity, setCdekCity] = useState('');
  const [cdekPickupPoint, setCdekPickupPoint] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

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

  const canSubmit = useMemo(() => {
    if (!cart?.items.length) return false;
    if (!name.trim() || !phone.trim()) return false;
    if (deliveryMethod === 'post') return Boolean(postIndex.trim() && postAddress.trim());
    return Boolean(cdekCity.trim() && cdekPickupPoint.trim());
  }, [cart?.items.length, name, phone, deliveryMethod, postIndex, postAddress, cdekCity, cdekPickupPoint]);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart?.items.length) return;
    setSubmitting(true);
    setError(null);
    try {
      const shippingAddress =
        deliveryMethod === 'post'
          ? `Почта России, индекс ${postIndex}, адрес: ${postAddress}`
          : `СДЭК, город ${cdekCity}, ПВЗ: ${cdekPickupPoint}`;

      const order = await ordersApi.create({
        shippingName: name,
        shippingPhone: phone,
        shippingAddress,
        paymentMethod: 'card',
      });

      await fetchCart();
      track('order_complete', { orderId: order.id, paymentMethod: payment, deliveryMethod });
      setPlacedOrderId(order.id);
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
          <div>
            <h1 className={styles.title}>Оформление заказа</h1>
            <p className={styles.subtitle}>Заполните данные и подтвердите заказ.</p>
          </div>
          <Link className={styles.back} to="/cart">
            ← Вернуться в корзину
          </Link>
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
          <form className={styles.grid} onSubmit={handleOrder}>
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Контакты</h2>
              <div className={styles.fields2}>
                <label className={styles.field}>
                  <span className={styles.label}>ФИО</span>
                  <input
                    className={styles.input}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+7 (999) 000-00-00"
                    required
                    autoComplete="tel"
                  />
                </label>
              </div>
            </section>

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Доставка</h2>
              <div className={styles.optionsRow}>
                <label className={`${styles.option} ${deliveryMethod === 'post' ? styles.optionActive : ''}`}>
                  <input
                    type="radio"
                    name="delivery"
                    value="post"
                    checked={deliveryMethod === 'post'}
                    onChange={() => setDeliveryMethod('post')}
                  />
                  Почта России
                </label>
                <label className={`${styles.option} ${deliveryMethod === 'cdek' ? styles.optionActive : ''}`}>
                  <input
                    type="radio"
                    name="delivery"
                    value="cdek"
                    checked={deliveryMethod === 'cdek'}
                    onChange={() => setDeliveryMethod('cdek')}
                  />
                  СДЭК
                </label>
              </div>

              {deliveryMethod === 'post' ? (
                <div className={styles.fields2}>
                  <label className={styles.field}>
                    <span className={styles.label}>Индекс</span>
                    <input
                      className={styles.input}
                      value={postIndex}
                      onChange={(e) => setPostIndex(e.target.value)}
                      placeholder="101000"
                      inputMode="numeric"
                      required
                      autoComplete="postal-code"
                    />
                  </label>
                  <label className={styles.field}>
                    <span className={styles.label}>Адрес</span>
                    <input
                      className={styles.input}
                      value={postAddress}
                      onChange={(e) => setPostAddress(e.target.value)}
                      placeholder="Город, улица, дом, квартира"
                      required
                      autoComplete="street-address"
                    />
                  </label>
                </div>
              ) : (
                <div className={styles.fields2}>
                  <label className={styles.field}>
                    <span className={styles.label}>Город</span>
                    <input
                      className={styles.input}
                      value={cdekCity}
                      onChange={(e) => setCdekCity(e.target.value)}
                      placeholder="Москва"
                      required
                      autoComplete="address-level2"
                    />
                  </label>
                  <label className={styles.field}>
                    <span className={styles.label}>ПВЗ</span>
                    <input
                      className={styles.input}
                      value={cdekPickupPoint}
                      onChange={(e) => setCdekPickupPoint(e.target.value)}
                      placeholder="Адрес ПВЗ или код"
                      required
                    />
                  </label>
                </div>
              )}
            </section>

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Оплата</h2>
              <div className={styles.optionsRow}>
                <label className={`${styles.option} ${payment === 'card' ? styles.optionActive : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={payment === 'card'}
                    onChange={() => setPayment('card')}
                  />
                  Банковская карта
                </label>
                <label className={`${styles.option} ${payment === 'sbp' ? styles.optionActive : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="sbp"
                    checked={payment === 'sbp'}
                    onChange={() => setPayment('sbp')}
                  />
                  СБП
                </label>
              </div>
              <p className={styles.hint}>Оплата происходит безопасно через платёжный сервис.</p>
            </section>

            <aside className={styles.summary}>
              <div className={styles.summaryCard}>
                <h2 className={styles.cardTitle}>Ваш заказ</h2>
                <p className={styles.total}>{formatPrice(totals.total)}</p>
                <p className={styles.meta}>
                  {cart.itemCount} {cart.itemCount === 1 ? 'товар' : cart.itemCount < 5 ? 'товара' : 'товаров'} ·{' '}
                  {totals.freeDelivery ? 'доставка бесплатно' : `бесплатно от ${formatPrice(FREE_DELIVERY_FROM)}`}
                </p>

                <div className={styles.itemsPreview}>
                  {itemsPreview.slice(0, 4).map((it) => (
                    <div key={`${it.name}-${it.quantity}`} className={styles.itemRow}>
                      <span className={styles.itemName}>{it.name}</span>
                      <strong className={styles.itemQty}>×{it.quantity}</strong>
                    </div>
                  ))}
                  {itemsPreview.length > 4 && (
                    <p className={styles.more}>и ещё {itemsPreview.length - 4}</p>
                  )}
                </div>

                <div className={styles.sumRow}>
                  <span>Товары</span>
                  <strong>{formatPrice(totals.originalSubtotal)}</strong>
                </div>
                {totals.discount > 0 && (
                  <div className={`${styles.sumRow} ${styles.sumRowSale}`}>
                    <span>Скидка</span>
                    <strong>−{formatPrice(totals.discount)}</strong>
                  </div>
                )}
                <div className={styles.sumRow}>
                  <span>Доставка</span>
                  <strong>{totals.freeDelivery ? 'Бесплатно' : 'При оформлении'}</strong>
                </div>

                {error && (
                  <p className={styles.error} role="alert">
                    {error}
                  </p>
                )}

                <Button size="lg" fullWidth type="submit" disabled={submitting || !canSubmit || loadingPriceMeta}>
                  {submitting ? 'Оформляем…' : 'Оформить заказ'}
                </Button>
                <p className={styles.legal}>
                  Нажимая «Оформить заказ», вы соглашаетесь с{' '}
                  <Link to="/privacy" className={styles.legalLink}>
                    политикой конфиденциальности
                  </Link>
                  .
                </p>
              </div>
            </aside>
          </form>
        )}

        {placedOrderId && (
          <div className={styles.successOverlay} role="presentation" onClick={() => setPlacedOrderId(null)}>
            <div
              className={styles.successDialog}
              role="dialog"
              aria-modal="true"
              aria-labelledby="order-success-title"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="order-success-title" className={styles.successTitle}>
                Заказ оформлен
              </h2>
              <p className={styles.successMeta}>
                Номер заказа: <strong>№ {orderShortId(placedOrderId)}</strong>
              </p>
              <div className={styles.successActions}>
                <Link to="/catalog" className={styles.successSecondary} onClick={() => setPlacedOrderId(null)}>
                  В каталог
                </Link>
                <Button
                  onClick={() => {
                    setPlacedOrderId(null);
                    navigate(`/account?tab=orders&orderId=${placedOrderId}`);
                  }}
                >
                  К моим заказам
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

