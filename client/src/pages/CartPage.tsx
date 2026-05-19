import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '@goshopix/shared';
import { ordersApi } from '../api/index';
import { Button, Input, StatusBadge } from '../design-system';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { PageContainer } from '../components/layout/PageContainer';
import styles from './CartPage.module.css';

export function CartPage() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const cart = useCartStore((s) => s.cart);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const isLoading = useCartStore((s) => s.isLoading);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState('card');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart?.items.length) return;
    setSubmitting(true);
    setError(null);
    try {
      const order = await ordersApi.create({
        shippingName: name,
        shippingPhone: phone,
        shippingAddress: address,
      });
      await fetchCart();
      navigate(`/account?tab=orders&orderId=${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось оформить заказ');
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) return null;

  return (
    <PageContainer>
      <div className={styles.page}>
      <h1 className={styles.title}>Корзина</h1>

      {isLoading && !cart && <p>Загрузка…</p>}

      {cart && cart.items.length === 0 && (
        <div className={styles.empty}>
          <p>Корзина пуста</p>
          <Link to="/catalog">
            <Button>Перейти в каталог</Button>
          </Link>
        </div>
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
                    <span />
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
                      onClick={() => void updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => void updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.variant.stock}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className={styles.itemRight}>
                  <span className={styles.lineTotal}>{formatPrice(item.lineTotal)}</span>
                  <button type="button" className={styles.remove} onClick={() => void removeItem(item.id)}>
                    Удалить
                  </button>
                </div>
              </li>
            ))}
          </ul>
          </div>

          <aside className={styles.checkout}>
            <div className={styles.summary}>
              <span>Итого ({cart.itemCount} шт.)</span>
              <strong>{formatPrice(cart.subtotal)}</strong>
            </div>

            <form className={styles.form} onSubmit={handleOrder}>
              <h2>Оформление заказа</h2>
              <Input label="ФИО" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input label="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              <Input
                label="Адрес доставки"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />

              <fieldset className={styles.payment}>
                <legend>Способ оплаты</legend>
                <label>
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={payment === 'card'}
                    onChange={() => setPayment('card')}
                  />
                  Банковская карта
                </label>
                <label>
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={payment === 'cash'}
                    onChange={() => setPayment('cash')}
                  />
                  При получении
                </label>
              </fieldset>

              {error && <StatusBadge variant="error" label={error} dot={false} />}
              <Button type="submit" fullWidth loading={submitting} disabled={submitting}>
                Оформить заказ
              </Button>
            </form>
          </aside>
        </div>
      )}
      </div>
    </PageContainer>
  );
}
