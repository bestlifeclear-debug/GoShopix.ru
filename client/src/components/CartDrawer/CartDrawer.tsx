import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '@goshopix/shared';
import { Button } from '../../design-system';
import { IconClose } from '../../design-system/icons/Icons';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import styles from './CartDrawer.module.css';

export function CartDrawer() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const drawerOpen = useCartStore((s) => s.drawerOpen);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const cart = useCartStore((s) => s.getCart());
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const isLoading = useCartStore((s) => s.isLoading);

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
    navigate('/auth?returnUrl=/cart');
  };

  const content = (
    <>
      <div className={styles.overlay} role="presentation" onClick={closeDrawer} />
      <aside className={styles.panel} role="dialog" aria-modal="true" aria-label="Корзина">
        <header className={styles.header}>
          <h2 className={styles.title}>Корзина</h2>
          <button type="button" className={styles.close} onClick={closeDrawer} aria-label="Закрыть">
            <IconClose />
          </button>
        </header>

        <div className={styles.body}>
          {!cart?.items.length ? (
            <div className={styles.empty}>
              <p>Корзина пуста</p>
              <Link to="/catalog" onClick={closeDrawer}>
                <Button variant="outline" size="sm">
                  В каталог
                </Button>
              </Link>
            </div>
          ) : (
            <ul className={styles.list}>
              {cart.items.map((item) => (
                <li key={item.id} className={styles.row}>
                  <Link
                    to={`/product/${item.product.id}`}
                    className={styles.thumb}
                    onClick={closeDrawer}
                  >
                    {item.product.imageUrl ? (
                      <img src={item.product.imageUrl} alt="" />
                    ) : null}
                  </Link>
                  <div className={styles.info}>
                    <Link
                      to={`/product/${item.product.id}`}
                      className={styles.name}
                      onClick={closeDrawer}
                    >
                      {item.product.name}
                    </Link>
                    {item.variant.name && <span className={styles.variant}>{item.variant.name}</span>}
                    <div className={styles.qty}>
                      <button
                        type="button"
                        className={styles.qtyBtn}
                        aria-label="Уменьшить количество"
                        onClick={() => void updateQuantity(item.id, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span className={styles.qtyValue}>{item.quantity}</span>
                      <button
                        type="button"
                        className={styles.qtyBtn}
                        aria-label="Увеличить количество"
                        disabled={item.quantity >= item.variant.stock}
                        onClick={() => void updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className={styles.right}>
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
          )}
        </div>

        {cart && cart.items.length > 0 && (
          <footer className={styles.footer}>
            <div className={styles.summary}>
              <span>Итого ({cart.itemCount} шт.)</span>
              <strong>{formatPrice(cart.subtotal)}</strong>
            </div>
            <Button type="button" fullWidth size="lg" onClick={handleCheckout} loading={isLoading}>
              Оплатить
            </Button>
            <p className={styles.hint}>Для оформления заказа войдите или зарегистрируйтесь</p>
          </footer>
        )}
      </aside>
    </>
  );

  return createPortal(content, document.body);
}
