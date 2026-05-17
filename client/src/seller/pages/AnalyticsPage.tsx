import { useEffect, useState } from 'react';
import { formatPrice } from '@goshopix/shared';
import { Input } from '../../design-system';
import { sellerApi } from '../api/index';
import type { GeographyReport, SalesReport, TopProductsReport } from '../api/types';
import { exportCsv } from '../components/exportCsv';
import styles from './sellerPages.module.css';

export function AnalyticsPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sales, setSales] = useState<SalesReport | null>(null);
  const [top, setTop] = useState<TopProductsReport | null>(null);
  const [geo, setGeo] = useState<GeographyReport | null>(null);

  useEffect(() => {
    const params = {
      from: from ? new Date(from).toISOString() : undefined,
      to: to ? new Date(to + 'T23:59:59').toISOString() : undefined,
      groupBy: 'day',
    };
    Promise.all([
      sellerApi.analytics.sales(params),
      sellerApi.analytics.topProducts({ ...params, limit: 10 }),
      sellerApi.analytics.geography(params),
    ]).then(([s, t, g]) => {
      setSales(s);
      setTop(t);
      setGeo(g);
    });
  }, [from, to]);

  const exportTop = () => {
    if (!top) return;
    exportCsv(
      'top-products.csv',
      ['Товар', 'Продано', 'Выручка'],
      top.items.map((i) => [i.name, i.unitsSold, i.revenue]),
    );
  };

  const exportGeo = () => {
    if (!geo) return;
    exportCsv(
      'geography.csv',
      ['Регион', 'Заказы', 'Выручка', 'Единиц'],
      geo.regions.map((r) => [r.region, r.orderCount, r.revenue, r.unitsSold]),
    );
  };

  return (
    <div>
      <h1 className={styles.pageTitle}>Аналитика</h1>
      <div className={styles.filters}>
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>

      {sales && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Отчёт по продажам</h2>
          <p>
            Заказов: {sales.totals.orderCount}, единиц: {sales.totals.unitsSold}, выручка:{' '}
            {formatPrice(sales.totals.revenue)}
          </p>
          <div className={styles.chart}>
            {sales.periods.slice(-14).map((p) => {
              const max = Math.max(...sales.periods.map((x) => x.revenue), 1);
              return (
                <div
                  key={p.period}
                  className={styles.chartBar}
                  style={{ height: `${(p.revenue / max) * 100}%` }}
                  title={`${p.period}: ${formatPrice(p.revenue)}`}
                />
              );
            })}
          </div>
        </section>
      )}

      {top && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Топ товаров{' '}
            <button type="button" onClick={exportTop}>
              CSV
            </button>
          </h2>
          <ol>
            {top.items.map((i) => (
              <li key={i.productId}>
                {i.name} — {i.unitsSold} шт., {formatPrice(i.revenue)}
              </li>
            ))}
          </ol>
        </section>
      )}

      {geo && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            География{' '}
            <button type="button" onClick={exportGeo}>
              CSV
            </button>
          </h2>
          <ul>
            {geo.regions.map((r) => (
              <li key={r.region}>
                {r.region}: {r.orderCount} заказов, {formatPrice(r.revenue)}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
