import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '@goshopix/shared';
import { CartItemCheckbox } from '../Cart/CartItemCheckbox';
import { EmptyCartState } from '../EmptyCart/EmptyCartState';
import { IconTrash } from '../../design-system/icons/Icons';
import { X } from 'lucide-react';
import { buildGuestCart } from '../../lib/guestCart.js';
import { computeLineTotals } from '../../lib/checkoutSelection';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import './cart-drawer.css';

function formatVariantOptions(item: {
  variant: { name: string | null; options: { name: string; value: string }[] };
}) {
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
  const serverCart = useCartStore((s) => s.cart);
  const guestItems = useCartStore((s) => s.guestItems);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const isLoading = useCartStore((s) => s.isLoading);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  const cart = useMemo(() => {
    if (token) return serverCart;
    if (guestItems.length === 0) return null;
    return buildGuestCart(guestItems);
  }, [token, serverCart, guestItems]);

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
    () => computeLineTotals(selectedItems, {}),
    [selectedItems],
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

  const handleCheckout = () => {
    if (!selectedItems.length) return;
    setCheckoutItemIds(selectedItems.map((item) => item.id));
    closeDrawer();
    navigate('/auth?returnUrl=/checkout');
  };

  const hasSelection = selectedCount > 0;

  const content = (
    <>
      <div
        className="cart-drawer-overlay fixed inset-0 z-[1100] bg-black/45"
        role="presentation"
        onClick={closeDrawer}
      />
      <aside
        className="cart-drawer-panel fixed top-0 right-0 z-[1101] flex h-full w-full max-w-[420px] flex-col bg-white shadow-[-8px_0_32px_rgb(0_0_0/0.15)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
      >
        <header className="cart-drawer-header">
          <h2 id="cart-drawer-title" className="cart-drawer-title">
            Корзина
          </h2>
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
            <EmptyCartState onCatalogClick={closeDrawer} />
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

            <ul className="cart-drawer-list">
              {cart.items.map((item) => {
                const variantLabel = formatVariantOptions(item);
                const isSelected = selectedIds.has(item.id);
                return (
                  <li
                    key={item.id}
                    className={`cart-drawer-item${isSelected ? '' : ' cart-drawer-itemMuted'}`}
                  >
                    <button
                      type="button"
                      className="cart-drawer-remove"
                      aria-label="Удалить товар"
                      onClick={() => void removeItem(item.id)}
                    >
                      <IconTrash />
                    </button>

                    <div className="cart-drawer-row">
                      <CartItemCheckbox
                        checked={isSelected}
                        onChange={() => toggleItemSelection(item.id)}
                        ariaLabel={`Выбрать ${item.product.name}`}
                      />

                      <Link
                        to={`/product/${item.product.id}`}
                        className="cart-drawer-thumb"
                        onClick={closeDrawer}
                      >
                        {item.product.imageUrl ? (
                          <img src={item.product.imageUrl} alt="" />
                        ) : null}
                      </Link>

                      <div className="min-w-0 flex-1">
                        <div className="cart-drawer-lineTop">
                          <div className="min-w-0 flex-1">
                            <Link
                              to={`/product/${item.product.id}`}
                              className="cart-drawer-name"
                              onClick={closeDrawer}
                            >
                              {item.product.name}
                            </Link>
                            {variantLabel ? (
                              <p className="cart-drawer-variant">{variantLabel}</p>
                            ) : null}
                          </div>
                          <span className="cart-drawer-price">{formatPrice(item.lineTotal)}</span>
                        </div>

                        <div className="cart-drawer-qty">
                          <button
                            type="button"
                            className="cart-drawer-qtyBtn"
                            aria-label="Уменьшить количество"
                            onClick={() => void updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          >
                            −
                          </button>
                          <span className="cart-drawer-qtyValue">{item.quantity}</span>
                          <button
                            type="button"
                            className="cart-drawer-qtyBtn"
                            aria-label="Увеличить количество"
                            disabled={item.quantity >= item.variant.stock}
                            onClick={() => void updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {cart && cart.items.length > 0 && (
          <footer className="cart-drawer-footer">
            <div className="cart-drawer-totalRow">
              <span className="cart-drawer-totalLabel">К оплате · {selectedCount} шт.</span>
              <span className="cart-drawer-totalAmount">
                {formatPrice(selectedLineTotals.subtotal)}
              </span>
            </div>
            <button
              type="button"
              className="cart-drawer-checkout"
              onClick={handleCheckout}
              disabled={isLoading || !hasSelection}
            >
              {isLoading ? 'Загрузка…' : 'Перейти к оформлению'}
            </button>
            <p className="cart-drawer-trust">Войдите, чтобы оформить заказ</p>
          </footer>
        )}
      </aside>
    </>
  );

  return createPortal(content, document.body);
}
