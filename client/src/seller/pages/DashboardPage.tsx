import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '@goshopix/shared';
import { sellerApi } from '../api/index';
import type { SellerDashboard } from '../api/types';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import styles from './sellerPages.module.css';

export function DashboardPage() {
  const [data, setData] = useState<SellerDashboard | null>(null);

  useEffect(() => {
    sellerApi.dashboard().then(setData).catch(() => {});
  }, []);

  if (!data) return <p>Загрузка…</p>;

  const maxRevenue = Math.max(...data.chart.map((c) => c.revenue), 1);

  return (
    <div>
      <h1 className={styles.pageTitle}>Дашборд</h1>
      <div className={styles.metrics}>
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>Сегодня</p>
          <p className={styles.metricValue}>{formatPrice(data.metrics.today.revenue)}</p>
          <p className={styles.metricLabel}>{data.metrics.today.orders} заказов</p>
        </div>
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>7 дней</p>
          <p className={styles.metricValue}>{formatPrice(data.metrics.week.revenue)}</p>
          <p className={styles.metricLabel}>{data.metrics.week.orders} заказов</p>
        </div>
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>30 дней</p>
          <p className={styles.metricValue}>{formatPrice(data.metrics.month.revenue)}</p>
          <p className={styles.metricLabel}>{data.metrics.month.orders} заказов</p>
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Продажи за 14 дней</h2>
        <div className={styles.chart}>
          {data.chart.map((c) => (
            <div
              key={c.period}
              className={styles.chartBar}
              style={{ height: `${(c.revenue / maxRevenue) * 100}%` }}
              title={`${c.period}: ${formatPrice(c.revenue)}`}
            />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Последние заказы</h2>
        <ul>
          {data.recentOrders.map((o) => (
            <li key={o.id}>
              <Link className={styles.link} to={`/seller/orders/${o.id}`}>
                #{o.id.slice(0, 8)}
              </Link>{' '}
              — {formatPrice(o.sellerRevenue)} — <OrderStatusBadge status={o.status} dot={false} />
            </li>
          ))}
        </ul>
      </section>

      {data.lowStock.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Низкий остаток</h2>
          <ul>
            {data.lowStock.map((v) => (
              <li key={v.variantId}>
                {v.productName} ({v.sku}) — остаток {v.stock}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
