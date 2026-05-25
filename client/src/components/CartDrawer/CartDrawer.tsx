import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { productsApi } from '../../api/index';
import type { CartItem, ProductListItem } from '../../api/types';
import { CartCheckoutSummary } from '../Cart/CartCheckoutSummary';
import { CartDeliveryUpsell } from '../Cart/CartDeliveryUpsell';
import { CartItemCheckbox } from '../Cart/CartItemCheckbox';
import { CartRecommendations } from '../Cart/CartRecommendations';
import { MobileCartItemCard } from '../Cart/MobileCartItemCard';
import { EmptyCartState } from '../EmptyCart/EmptyCartState';
import { buildCompareAtByProductFromGuest } from '../../lib/cartItemPricing';
import { snapshotFromDetail } from '../../lib/cartSnapshot';
import { buildGuestCart } from '../../lib/guestCart.js';
import { computeLineTotals } from '../../lib/checkoutSelection';
import { formatEstimatedDeliveryDate } from '../../lib/cartDeliveryDate';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import './cart-drawer.css';

function formatVariantOptions(item: CartItem) {
  const fromOptions = item.variant.options
    .map((o) => o.value)
    .filter(Boolean)
    .join(' · ');
  if (fromOptions) return fromOptions;
  return item.variant.name ?? null;
}

export function CartDrawer() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const drawerOpen = useCartStore((s) => s.drawerOpen);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const setCheckoutItemIds = useCartStore((s) => s.setCheckoutItemIds);
  const guestItems = useCartStore((s) => s.guestItems);
  const addToCart = useCartStore((s) => s.addToCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const isLoading = useCartStore((s) => s.isLoading);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const deliveryDateLabel = useMemo(() => formatEstimatedDeliveryDate(7), []);

  const cart = useMemo(() => {
    if (guestItems.length === 0) return null;
    return buildGuestCart(guestItems);
  }, [guestItems]);

  const compareAtByProduct = useMemo(
    () => buildCompareAtByProductFromGuest(guestItems),
    [guestItems],
  );

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

  const isGuestDrawer = drawerOpen && !token;

  useEffect(() => {
    if (token && drawerOpen) closeDrawer();
  }, [token, drawerOpen, closeDrawer]);

  useEffect(() => {
    if (!isGuestDrawer) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [isGuestDrawer, closeDrawer]);

  if (!isGuestDrawer) return null;

  const proceedToAuth = () => {
    if (!selectedItems.length) return;
    setCheckoutItemIds(selectedItems.map((item) => item.id));
    closeDrawer();
    navigate('/auth?returnUrl=/checkout');
  };

  const handleRecommendAdd = async (product: ProductListItem) => {
    try {
      const detail = await productsApi.get(product.id);
      const variant = detail.variants.find((v) => v.isDefault) ?? detail.variants[0];
      if (!variant) return;
      await addToCart(variant.id, 1, snapshotFromDetail(detail, variant));
    } catch {
      /* ignore */
    }
  };

  const itemCountLabel = cart
    ? `${cart.itemCount} ${cart.itemCount === 1 ? 'товар' : cart.itemCount < 5 ? 'товара' : 'товаров'}`
    : '';

  const showQuickBuy = (cart?.items.length ?? 0) === 1;

  const content = (
    <>
      <div className="cart-drawer-overlay" role="presentation" onClick={closeDrawer} />
      <aside
        className="cart-drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
      >
        <header className="cart-drawer-header">
          <div className="cart-drawer-headerText">
            <h2 id="cart-drawer-title" className="cart-drawer-title">
              Корзина
            </h2>
            {cart && cart.items.length > 0 ? (
              <p className="cart-drawer-meta">{itemCountLabel}</p>
            ) : null}
          </div>
          <button
            type="button"
            className="cart-drawer-close"
            onClick={closeDrawer}
            aria-label="Закрыть корзину"
          >
            <X size={22} strokeWidth={1.75} aria-hidden />
          </button>
        </header>

        {!cart?.items.length ? (
          <div className="cart-drawer-empty">
            <EmptyCartState onCatalogClick={closeDrawer} hint="Добавьте товары — оформление займёт пару минут" />
          </div>
        ) : (
          <div className="cart-drawer-body">
            <div className="cart-drawer-selectAll">
              <CartItemCheckbox
                checked={allSelected}
                onChange={() => toggleSelectAll()}
                ariaLabel="Выбрать все товары"
              />
              <button type="button" className="cart-drawer-selectAllBtn" onClick={toggleSelectAll}>
                Выбрать всё
              </button>
            </div>

            <CartDeliveryUpsell lineTotals={selectedLineTotals} compact />

            <ul className="cart-drawer-list">
              {cart.items.map((item) => (
                <MobileCartItemCard
                  key={item.id}
                  item={item}
                  compareAt={compareAtByProduct[item.product.id]}
                  isSelected={selectedIds.has(item.id)}
                  deliveryDateLabel={deliveryDateLabel}
                  variantLabel={formatVariantOptions(item)}
                  onToggle={() => toggleItemSelection(item.id)}
                  onUpdateQuantity={(qty) => void updateQuantity(item.id, qty)}
                  onRemove={() => void removeItem(item.id)}
                  onProductNavigate={closeDrawer}
                />
              ))}
            </ul>

            <CartRecommendations onAdd={handleRecommendAdd} title="Добавьте к заказу" />
          </div>
        )}

        {cart && cart.items.length > 0 && (
          <footer className="cart-drawer-footer">
            <CartCheckoutSummary
              lineTotals={selectedLineTotals}
              selectedCount={selectedCount}
              onCheckout={proceedToAuth}
              onQuickCheckout={proceedToAuth}
              showQuickBuy={showQuickBuy}
              checkoutLabel={isLoading ? 'Загрузка…' : 'Оформить заказ'}
              checkoutDisabled={isLoading}
              trustLine={
                <p className="cart-drawer-trust">
                  <button
                    type="button"
                    className="cart-drawer-trustBtn"
                    onClick={proceedToAuth}
                    disabled={isLoading || selectedCount === 0}
                  >
                    Войти за минуту — корзина сохранится
                  </button>
                </p>
              }
            />
          </footer>
        )}
      </aside>
    </>
  );

  return createPortal(content, document.body);
}
