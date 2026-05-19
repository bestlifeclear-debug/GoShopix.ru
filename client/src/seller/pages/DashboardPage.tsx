import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Calendar, Package, TrendingUp, Wallet } from 'lucide-react';
import { formatPrice } from '@goshopix/shared';
import {
  MOCK_CHART,
  MOCK_LOW_STOCK,
  MOCK_METRICS,
  MOCK_RECENT_ORDERS,
  type DashboardRecentOrder,
} from './dashboard/mockData';
import styles from './DashboardPage.module.css';

const CHART_COLOR = '#d81b60';
const CHART_COLOR_SOFT = 'rgb(216 27 96 / 0.85)';

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { period: string; revenue: number; orderCount: number } }[];
}) {
  if (!active || !payload?.[0]) return null;
  const row = payload[0].payload;
  return (
    <div
      style={{
        padding: '10px 14px',
        borderRadius: 12,
        border: '1px solid #f1f5f9',
        background: '#fff',
        boxShadow: '0 8px 24px rgb(15 23 42 / 0.12)',
        fontSize: 13,
      }}
    >
      <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#1e293b' }}>{row.period}</p>
      <p style={{ margin: 0, color: CHART_COLOR, fontWeight: 700 }}>{formatPrice(row.revenue)}</p>
      <p style={{ margin: '4px 0 0', color: '#64748b' }}>{row.orderCount} заказов</p>
    </div>
  );
}

function OrderStatusPill({ order }: { order: DashboardRecentOrder }) {
  const classMap = {
    delivered: styles.statusDelivered,
    shipped: styles.statusShipped,
    processing: styles.statusProcessing,
    pending: styles.statusPending,
  } as const;
  return (
    <span className={`${styles.statusBadge} ${classMap[order.status]}`}>{order.statusLabel}</span>
  );
}

function stockBarClass(stock: number) {
  if (stock <= 3) return styles.stockBarCritical;
  return styles.stockBarLow;
}

export function DashboardPage() {
  const kpiCards = [
    { label: 'Сегодня', ...MOCK_METRICS.today, icon: Wallet },
    { label: '7 дней', ...MOCK_METRICS.week, icon: TrendingUp },
    { label: '30 дней', ...MOCK_METRICS.month, icon: Calendar },
  ] as const;

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Дашборд</h1>
          <p className={styles.pageSubtitle}>Обзор продаж и операционных показателей магазина</p>
        </div>
      </header>

      <div className={styles.kpiGrid}>
        {kpiCards.map(({ label, revenue, orders, icon: Icon }) => (
          <article key={label} className={styles.kpiCard}>
            <span className={styles.kpiIcon} aria-hidden>
              <Icon size={22} strokeWidth={2} />
            </span>
            <p className={styles.kpiLabel}>{label}</p>
            <p className={styles.kpiValue}>{formatPrice(revenue)}</p>
            <p className={styles.kpiMeta}>{orders} заказов</p>
          </article>
        ))}
      </div>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Продажи за 14 дней</h2>
        <div className={styles.chartWrap}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_CHART} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="period"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
                width={40}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgb(216 27 96 / 0.06)' }} />
              <Bar
                dataKey="revenue"
                fill={CHART_COLOR_SOFT}
                radius={[8, 8, 0, 0]}
                maxBarSize={40}
                activeBar={{ fill: CHART_COLOR }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className={styles.bottomGrid}>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Последние заказы</h2>
          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th>Заказ</th>
                <th>Дата</th>
                <th>Сумма</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_RECENT_ORDERS.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link className={styles.orderLink} to={`/seller/orders/${order.id}`}>
                      {order.number}
                    </Link>
                  </td>
                  <td className={styles.orderDate}>{order.date}</td>
                  <td className={styles.orderAmount}>{formatPrice(order.amount)}</td>
                  <td>
                    <OrderStatusPill order={order} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link className={styles.viewAllLink} to="/seller/orders">
            Все заказы →
          </Link>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Низкий остаток</h2>
          <ul className={styles.lowStockList}>
            {MOCK_LOW_STOCK.map((item) => {
              const pct = Math.min(100, Math.round((item.stock / item.maxStock) * 100));
              return (
                <li key={item.variantId} className={styles.stockItem}>
                  <div className={styles.stockThumb} aria-hidden>
                    <Package size={22} />
                  </div>
                  <div className={styles.stockBody}>
                    <div className={styles.stockNameRow}>
                      <span className={styles.stockWarning} aria-hidden>
                        ⚠️
                      </span>
                      <p className={styles.stockName}>{item.productName}</p>
                    </div>
                    <p className={styles.stockSku}>{item.sku}</p>
                    <div className={styles.stockBarTrack}>
                      <div
                        className={`${styles.stockBarFill} ${stockBarClass(item.stock)}`}
                        style={{ width: `${Math.max(pct, 6)}%` }}
                      />
                    </div>
                    <p className={styles.stockCount}>
                      Остаток: <strong>{item.stock}</strong> шт.
                    </p>
                  </div>
                  <button type="button" className={styles.restockBtn}>
                    Пополнить
                  </button>
                </li>
              );
            })}
          </ul>
          <Link className={styles.viewAllLink} to="/seller/products">
            Управление товарами →
          </Link>
        </section>
      </div>
    </div>
  );
}
