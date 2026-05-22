import { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '@goshopix/shared';
import { Button } from '../../design-system';
import { IconClose, IconTrash } from '../../design-system/icons/Icons';
import { buildGuestCart } from '../../lib/guestCart.js';
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
  const serverCart = useCartStore((s) => s.cart);
  const guestItems = useCartStore((s) => s.guestItems);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const isLoading = useCartStore((s) => s.isLoading);

  const cart = useMemo(() => {
    if (token) return serverCart;
    if (guestItems.length === 0) return null;
    return buildGuestCart(guestItems);
  }, [token, serverCart, guestItems]);

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
    closeDrawer();
    navigate('/auth?returnUrl=/checkout');
  };

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
        aria-label="Корзина"
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <h2 className="m-0 text-lg font-bold text-slate-800">Корзина</h2>
          <button
            type="button"
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
            onClick={closeDrawer}
            aria-label="Закрыть"
          >
            <IconClose />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {!cart?.items.length ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 text-center text-sm text-slate-500">
              <p className="m-0">Корзина пуста</p>
              <Link to="/catalog" onClick={closeDrawer}>
                <Button variant="outline" size="sm">
                  В каталог
                </Button>
              </Link>
            </div>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-4 p-0">
              {cart.items.map((item) => {
                const variantLabel = formatVariantOptions(item);
                return (
                  <li
                    key={item.id}
                    className="relative border-b border-slate-100 pb-4 last:border-b-0 last:pb-0"
                  >
                    <button
                      type="button"
                      className="absolute top-0.5 right-1.5 z-10 cursor-pointer rounded-md border-0 bg-transparent p-1.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-red-500"
                      aria-label="Удалить товар"
                      onClick={() => void removeItem(item.id)}
                    >
                      <IconTrash />
                    </button>

                    <div className="grid grid-cols-[56px_1fr] gap-3 pr-9">
                      <Link
                        to={`/product/${item.product.id}`}
                        className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-50"
                        onClick={closeDrawer}
                      >
                        {item.product.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </Link>

                      <div className="min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1 pr-3">
                            <Link
                              to={`/product/${item.product.id}`}
                              className="line-clamp-2 text-sm font-medium leading-snug text-slate-800 no-underline transition-colors hover:text-red-500"
                              onClick={closeDrawer}
                            >
                              {item.product.name}
                            </Link>
                            {variantLabel && (
                              <p className="mt-1 pr-1 text-xs leading-relaxed text-slate-400">
                                {variantLabel}
                              </p>
                            )}
                          </div>
                          <span className="mr-1 shrink-0 text-sm font-semibold whitespace-nowrap text-slate-800">
                            {formatPrice(item.lineTotal)}
                          </span>
                        </div>

                        <div className="mt-2.5 inline-flex items-center rounded-lg border border-slate-200 bg-slate-50">
                          <button
                            type="button"
                            className="cursor-pointer border-0 bg-transparent px-3 py-1 text-base font-medium text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Уменьшить количество"
                            onClick={() => void updateQuantity(item.id, item.quantity - 1)}
                          >
                            −
                          </button>
                          <span className="px-2 text-sm font-semibold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="cursor-pointer border-0 bg-transparent px-3 py-1 text-base font-medium text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
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
          )}
        </div>

        {cart && cart.items.length > 0 && (
          <footer className="sticky bottom-0 left-0 right-0 shrink-0 border-t border-slate-100 bg-white p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
            <div className="mb-4 flex items-baseline justify-between gap-3 text-base font-bold text-slate-800">
              <span>Итого ({cart.itemCount} шт.)</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
            <button
              type="button"
              className="w-full cursor-pointer rounded-xl border-0 bg-red-500 py-4 text-base font-medium text-white shadow-sm transition-all hover:bg-red-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleCheckout}
              disabled={isLoading}
            >
              {isLoading ? 'Загрузка…' : 'Оформить заказ'}
            </button>
          </footer>
        )}
      </aside>
    </>
  );

  return createPortal(content, document.body);
}
