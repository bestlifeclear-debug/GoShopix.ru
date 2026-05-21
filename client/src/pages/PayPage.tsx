import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ordersApi } from '../api';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../design-system';
import styles from './PayPage.module.css';

export function PayPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const orderId = params.get('orderId') ?? '';
  const method = (params.get('method') ?? 'card') as 'card' | 'sbp';
  const returnUrl = params.get('returnUrl') ?? '/checkout/confirmation';

  const [loading, setLoading] = useState(false);
  const title = useMemo(() => (method === 'sbp' ? 'Оплата через СБП' : 'Оплата картой'), [method]);

  const goReturn = (status: 'paid' | 'cancelled') => {
    const url = new URL(returnUrl, window.location.origin);
    if (orderId) url.searchParams.set('orderId', orderId);
    url.searchParams.set('payment', status);
    window.location.href = url.toString();
  };

  const handlePay = async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      await ordersApi.pay(orderId);
      goReturn('paid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className={styles.page}>
        <header className={styles.head}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>
            Это имитация платёжного шлюза. В реальной интеграции здесь будет страница платёжной системы.
          </p>
        </header>

        {!orderId && (
          <div className={styles.card}>
            <p className={styles.error}>Не найден orderId. Вернитесь к оформлению.</p>
            <Link to="/checkout">
              <Button>К оформлению</Button>
            </Link>
          </div>
        )}

        {orderId && (
          <div className={styles.card}>
            <div className={styles.row}>
              <span className={styles.label}>Заказ</span>
              <strong className={styles.value}>#{orderId.slice(0, 8)}</strong>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Способ оплаты</span>
              <strong className={styles.value}>{method === 'sbp' ? 'СБП' : 'Банковская карта'}</strong>
            </div>

            <div className={styles.actions}>
              <Button size="lg" onClick={() => void handlePay()} loading={loading}>
                Оплатить
              </Button>
              <button type="button" className={styles.cancel} onClick={() => goReturn('cancelled')} disabled={loading}>
                Отменить
              </button>
            </div>

            <button type="button" className={styles.back} onClick={() => navigate('/checkout')} disabled={loading}>
              ← Назад к оформлению
            </button>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

