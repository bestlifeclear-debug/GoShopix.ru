import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '@goshopix/shared';
import { productsApi } from '../api/index';
import type { ProductListItem } from '../api/types';
import { MobileCartList } from '../components/Cart/MobileCartList';
import { ProductGrid } from '../components/ProductGrid';
import { PageContainer } from '../components/layout/PageContainer';
import { EmptyCartState } from '../components/EmptyCart/EmptyCartState';
import { Button, Loader } from '../design-system';
import { snapshotFromDetail } from '../lib/cartSnapshot';
import { computeLineTotals, FREE_DELIVERY_FROM } from '../lib/checkoutSelection';
import { track } from '../lib/analytics';
import { ApiClientError } from '../api/client';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import './cart-page-mobile.css';
import styles from './CartPage.module.css';

export function CartPage() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const cart = useCartStore((s) => s.cart);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const addToCart = useCartStore((s) => s.addToCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const setCheckoutItemIds = useCartStore((s) => s.setCheckoutItemIds);
  const isLoading = useCartStore((s) => s.isLoading);

  const [hits, setHits] = useState<ProductListItem[]>([]);
  const [hitsLoading, setHitsLoading] = useState(false);
  const [compareAtByProduct, setCompareAtByProduct] = useState<Record<string, number | null>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate('/auth?returnUrl=/cart');
      return;
    }
    void fetchCart();
  }, [token, fetchCart, navigate]);

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

  const cartItemIds = useMemo(
    () => (cart?.items ?? []).map((i) => i.id).join('|'),
    [cart?.items],
  );

  useEffect(() => {
    if (!cart?.items.length) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds((prev) => {
      const itemIds = cart.items.map((i) => i.id);
      const validIds = new Set(itemIds);
      if (prev.size === 0) {
        return new Set(itemIds);
      }
      const next = new Set<string>();
      for (const id of prev) {
        if (validIds.has(id)) next.add(id);
      }
      for (const id of itemIds) {
        if (!prev.has(id)) next.add(id);
      }
      return next.size > 0 ? next : new Set(itemIds);
    });
  }, [cartItemIds, cart?.items]);

  const allSelected = Boolean(
    cart?.items.length && cart.items.every((item) => selectedIds.has(item.id)),
  );

  const toggleItemSelection = useCallback((itemId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (!cart?.items.length) return;
    setSelectedIds((prev) => {
      if (cart.items.every((item) => prev.has(item.id))) {
        return new Set();
      }
      return new Set(cart.items.map((i) => i.id));
    });
  }, [cart?.items]);

  const selectedItems = useMemo(() => {
    if (!cart) return [];
    return cart.items.filter((item) => selectedIds.has(item.id));
  }, [cart, selectedIds]);

  const selectedCount = useMemo(
    () => selectedItems.reduce((n, item) => n + item.quantity, 0),
    [selectedItems],
  );

  const selectedLineTotals = useMemo(
    () => computeLineTotals(selectedItems, compareAtByProduct),
    [selectedItems, compareAtByProduct],
  );

  const totals = useMemo(() => {
    if (!cart) {
      return {
        originalSubtotal: 0,
        discount: 0,
        subtotal: 0,
        total: 0,
        freeDelivery: false,
        deliveryRemaining: FREE_DELIVERY_FROM,
      };
    }
    const line = computeLineTotals(cart.items, compareAtByProduct);
    return {
      originalSubtotal: line.originalSubtotal,
      discount: line.discount,
      subtotal: line.subtotal,
      total: line.subtotal,
      freeDelivery: line.freeDelivery,
      deliveryRemaining: line.deliveryRemaining,
    };
  }, [cart, compareAtByProduct]);

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

  const showInitialLoader = isLoading && cart === null;
  const isEmpty = !showInitialLoader && (cart?.items.length ?? 0) === 0;

  const handleCheckout = () => {
    if (!cart?.items.length || selectedItems.length === 0) return;
    setError(null);
    setCheckoutItemIds(selectedItems.map((item) => item.id));
    track('checkout_open');
    navigate('/checkout');
  };

  return (
    <PageContainer className={styles.cartContainer}>
      <div
        className={`${styles.page} ${cart && cart.items.length > 0 ? styles.pageWithItems : ''}`}
      >
        <h1 className={`${styles.title} ${styles.titleDesktopOnly}`}>Корзина</h1>

        {showInitialLoader && <Loader variant="block" label="Загружаем корзину…" />}

        {isEmpty && (
          <>
            <div className={styles.emptyWrap}>
              <EmptyCartState hint="Добавьте товары из каталога или выберите хиты ниже" />
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
          <>
            <MobileCartList
              items={cart.items}
              compareAtByProduct={compareAtByProduct}
              selectedIds={selectedIds}
              lineTotals={selectedLineTotals}
              onToggleItem={toggleItemSelection}
              onToggleAll={toggleSelectAll}
              allSelected={allSelected}
              onUpdateQuantity={(id, qty) => void updateQuantity(id, qty)}
              onRemoveItem={(id) => void removeItem(id)}
              selectedCount={selectedCount}
              onCheckout={handleCheckout}
            />

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
                  onClick={handleCheckout}
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
          </>
        )}

      </div>
    </PageContainer>
  );
}
