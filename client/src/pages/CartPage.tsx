import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '@goshopix/shared';
import { ordersApi, productsApi } from '../api/index';
import type { ProductListItem } from '../api/types';
import { ProductGrid } from '../components/ProductGrid';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../design-system';
import { CheckoutModal } from '../components/CheckoutModal/CheckoutModal';
import { snapshotFromDetail } from '../lib/cartSnapshot';
import { track } from '../lib/analytics';
import { ApiClientError } from '../api/client';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { orderShortId } from './account/utils';
import styles from './CartPage.module.css';

const FREE_DELIVERY_FROM = 2000;

export function CartPage() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const cart = useCartStore((s) => s.cart);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const addToCart = useCartStore((s) => s.addToCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const isLoading = useCartStore((s) => s.isLoading);

  const [hits, setHits] = useState<ProductListItem[]>([]);
  const [hitsLoading, setHitsLoading] = useState(false);
  const [compareAtByProduct, setCompareAtByProduct] = useState<Record<string, number | null>>({});
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [payment, setPayment] = useState<'card' | 'sbp'>('card');
  const [deliveryMethod, setDeliveryMethod] = useState<'post' | 'cdek'>('post');
  const [postIndex, setPostIndex] = useState('');
  const [postAddress, setPostAddress] = useState('');
  const [cdekCity, setCdekCity] = useState('');
  const [cdekPickupPoint, setCdekPickupPoint] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate('/auth?returnUrl=/cart');
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
    setHitsLoading(true);
    void productsApi
      .list({ page: 1, limit: 4, sort: 'popular' })
      .then((res) => setHits(res.items.slice(0, 4)))
      .catch(() => setHits([]))
      .finally(() => setHitsLoading(false));
  }, []);

  useEffect(() => {
    if (!cart?.items.length) {
      setCompareAtByProduct({});
      return;
    }

    let cancelled = false;
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
      });

    return () => {
      cancelled = true;
    };
  }, [cart?.updatedAt, cart?.itemCount, cart?.items.map((i) => `${i.id}:${i.quantity}`).join('|')]);

  useEffect(() => {
    if (checkoutOpen) track('checkout_open');
  }, [checkoutOpen]);

  useEffect(() => {
    if (!placedOrderId) return;
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
    };
  }, [placedOrderId]);

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
      const unitOriginal =
        compareAt != null && compareAt > item.unitPrice ? compareAt : item.unitPrice;
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
      setCheckoutOpen(false);
      await fetchCart();
      track('order_complete', { orderId: order.id, paymentMethod: payment });
      setPlacedOrderId(order.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось оформить заказ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecommendAdd = async (product: ProductListItem) => {
    try {
      const detail = await productsApi.get(product.id);
      const variant = detail.variants.find((v) => v.isDefault) ?? detail.variants[0];
      if (!variant) return;
      await addToCart(variant.id, 1, snapshotFromDetail(detail, variant));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Не удалось добавить товар');
    }
  };

  if (!token) return null;

  const isEmpty = cart && cart.items.length === 0;

  return (
    <PageContainer>
      <div className={styles.page}>
        <h1 className={styles.title}>Корзина</h1>

        {isLoading && !cart && <p className={styles.loading}>Загрузка…</p>}

        {isEmpty && (
          <>
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>Корзина пуста</p>
              <p className={styles.emptyHint}>Добавьте товары из каталога или выберите хиты ниже</p>
              <Link to="/catalog">
                <Button>Перейти в каталог</Button>
              </Link>
            </div>

            <section className={styles.recommend}>
              <h2 className={styles.recommendTitle}>Хиты продаж</h2>
              <ProductGrid
                products={hits}
                loading={hitsLoading}
                skeletonCount={4}
                minSlots={4}
                onAddToCart={handleRecommendAdd}
              />
            </section>
          </>
        )}

        {cart && cart.items.length > 0 && (
          <div className={styles.layout}>
            <div className={styles.itemsCol}>
              <ul className={styles.items}>
                {cart.items.map((item) => (
                  <li key={item.id} className={styles.item}>
                    <Link to={`/product/${item.product.id}`} className={styles.itemImage}>
                      {item.product.imageUrl ? (
                        <img src={item.product.imageUrl} alt="" />
                      ) : (
                        <span className={styles.itemImagePlaceholder} />
                      )}
                    </Link>
                    <div className={styles.itemBody}>
                      <Link to={`/product/${item.product.id}`} className={styles.itemName}>
                        {item.product.name}
                      </Link>
                      {item.variant.name && (
                        <span className={styles.variant}>{item.variant.name}</span>
                      )}
                      <div className={styles.qtyRow}>
                        <button
                          type="button"
                          aria-label="Уменьшить количество"
                          onClick={() => void updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Увеличить количество"
                          onClick={() => void updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.variant.stock}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className={styles.itemRight}>
                      <span className={styles.lineTotal}>{formatPrice(item.lineTotal)}</span>
                      <button
                        type="button"
                        className={styles.remove}
                        onClick={() => void removeItem(item.id)}
                      >
                        Удалить
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <aside className={styles.summaryCol}>
              <div className={`gsp-panel ${styles.summaryCard}`}>
                <h2 className={styles.summaryHeading}>Итого</h2>

                <dl className={styles.summaryRows}>
                  <div className={styles.summaryRow}>
                    <dt>
                      Товары ({cart.itemCount} {cart.itemCount === 1 ? 'шт.' : 'шт.'})
                    </dt>
                    <dd>{formatPrice(totals.originalSubtotal)}</dd>
                  </div>

                  {totals.discount > 0 && (
                    <div className={`${styles.summaryRow} ${styles.summaryRowSale}`}>
                      <dt>Скидка</dt>
                      <dd>−{formatPrice(totals.discount)}</dd>
                    </div>
                  )}

                  <div className={styles.summaryRow}>
                    <dt>Доставка</dt>
                    <dd className={styles.summaryDelivery}>
                      {totals.freeDelivery ? 'Бесплатно' : 'Рассчитаем при оформлении'}
                    </dd>
                  </div>
                </dl>

                <div className={styles.summaryTotal}>
                  <span>К оплате</span>
                  <strong>{formatPrice(totals.total)}</strong>
                </div>

                {!totals.freeDelivery && totals.subtotal > 0 && (
                  <div className={styles.deliveryProgress}>
                    <p className={styles.deliveryProgressText}>
                      До бесплатной доставки осталось{' '}
                      {formatPrice(Math.max(0, FREE_DELIVERY_FROM - totals.subtotal))}
                    </p>
                    <div className={styles.deliveryProgressTrack} aria-hidden>
                      <div
                        className={styles.deliveryProgressFill}
                        style={{
                          width: `${Math.min(100, (totals.subtotal / FREE_DELIVERY_FROM) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                <Button
                  size="lg"
                  fullWidth
                  className={styles.checkoutBtn}
                  onClick={() => {
                    setError(null);
                    setCheckoutOpen(true);
                  }}
                >
                  Перейти к оформлению
                </Button>

                <p className={styles.summaryNote}>
                  {totals.freeDelivery
                    ? 'Бесплатная доставка применена'
                    : `Бесплатная доставка от ${formatPrice(FREE_DELIVERY_FROM)}`}
                </p>
              </div>
            </aside>
          </div>
        )}

        <CheckoutModal
          open={checkoutOpen}
          onClose={() => !submitting && setCheckoutOpen(false)}
          onSubmit={handleOrder}
          name={name}
          phone={phone}
          payment={payment}
          deliveryMethod={deliveryMethod}
          postIndex={postIndex}
          postAddress={postAddress}
          cdekCity={cdekCity}
          cdekPickupPoint={cdekPickupPoint}
          onNameChange={setName}
          onPhoneChange={setPhone}
          onPaymentChange={setPayment}
          onDeliveryMethodChange={setDeliveryMethod}
          onPostIndexChange={setPostIndex}
          onPostAddressChange={setPostAddress}
          onCdekCityChange={setCdekCity}
          onCdekPickupPointChange={setCdekPickupPoint}
          total={totals.total}
          itemCount={cart?.itemCount ?? 0}
          originalSubtotal={totals.originalSubtotal}
          discount={totals.discount}
          freeDelivery={totals.freeDelivery}
          freeDeliveryFrom={FREE_DELIVERY_FROM}
          items={(cart?.items ?? []).map((it) => ({ name: it.product.name, quantity: it.quantity }))}
          error={error}
          submitting={submitting}
        />

        {placedOrderId && (
          <div
            className={styles.orderSuccessOverlay}
            role="presentation"
            onClick={() => setPlacedOrderId(null)}
          >
            <div
              className={styles.orderSuccessDialog}
              role="dialog"
              aria-modal="true"
              aria-labelledby="order-success-title"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="order-success-title" className={styles.orderSuccessTitle}>
                Заказ оформлен
              </h2>
              <p className={styles.orderSuccessMeta}>
                Номер заказа: <strong>№ {orderShortId(placedOrderId)}</strong>
              </p>
              <p className={styles.orderSuccessHint}>Мы отправили детали в раздел «Мои заказы».</p>
              <div className={styles.orderSuccessActions}>
                <Link to="/catalog" className={styles.orderSuccessSecondary} onClick={() => setPlacedOrderId(null)}>
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
