import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ordersApi } from '../api';
import type { Order } from '../api/types';
import { PageContainer } from '../components/layout/PageContainer';
import { Button, Loader } from '../design-system';
import styles from './CheckoutConfirmationPage.module.css';

export function CheckoutConfirmationPage() {
  const [params] = useSearchParams();
  const orderId = params.get('orderId') ?? '';
  const payment = params.get('payment') ?? '';

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    void ordersApi
      .get(orderId)
      .then((o) => setOrder(o))
      .catch((e) => setError(e instanceof Error ? e.message : 'Не удалось загрузить заказ'))
      .finally(() => setLoading(false));
  }, [orderId]);

  return (
    <PageContainer>
      <div className={styles.page}>
        <header className={styles.head}>
          <h1 className={styles.title}>Подтверждение заказа</h1>
          <p className={styles.subtitle}>Статус обновится после обработки платежа.</p>
        </header>

        {!orderId && (
          <div className={styles.card}>
            <p className={styles.error}>Не найден orderId. Перейдите в «Мои заказы» или попробуйте оформить снова.</p>
            <div className={styles.actions}>
              <Link to="/account?tab=orders">
                <Button>Мои заказы</Button>
              </Link>
              <Link to="/checkout">
                <Button variant="outline">К оформлению</Button>
              </Link>
            </div>
          </div>
        )}

        {orderId && (
          <div className={styles.card}>
            {loading && <Loader variant="inline" label="Загружаем заказ…" />}
            {error && <p className={styles.error}>{error}</p>}

            {order && (
              <>
                <div className={styles.row}>
                  <span className={styles.label}>Заказ</span>
                  <strong className={styles.value}>#{order.id.slice(0, 8)}</strong>
                </div>
                <div className={styles.row}>
                  <span className={styles.label}>Статус</span>
                  <strong className={styles.value}>{order.statusMeta?.name ?? order.status}</strong>
                </div>
                <div className={styles.row}>
                  <span className={styles.label}>Оплата</span>
                  <strong className={styles.value}>
                    {payment === 'paid' ? 'Оплачено' : payment === 'cancelled' ? 'Отменено' : 'В обработке'}
                  </strong>
                </div>

                <div className={styles.actions}>
                  <Link to={`/account?tab=orders&orderId=${order.id}`}>
                    <Button>Открыть заказ</Button>
                  </Link>
                  <Link to="/catalog">
                    <Button variant="outline">В каталог</Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
}

