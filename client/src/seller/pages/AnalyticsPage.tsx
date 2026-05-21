import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Percent, TrendingUp, Users } from 'lucide-react';
import { formatPrice } from '@goshopix/shared';
import {
  MOCK_ANALYTICS,
  PERIOD_LABELS,
  type AnalyticsPeriod,
} from './analytics/mockData';
import shared from './shared/sellerPremium.module.css';

const CHART_COLOR = '#ff3d2e';
const CHART_COLOR_SOFT = 'rgb(var(--color-primary-rgb) / 0.85)';

const PERIODS: AnalyticsPeriod[] = ['today', 'week', 'month'];

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

function formatKpiValue(kind: 'sales' | 'visitors' | 'conversion', value: number) {
  if (kind === 'sales') return formatPrice(value);
  if (kind === 'conversion') return `${value.toFixed(1)}%`;
  return value.toLocaleString('ru-RU');
}

export function AnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('month');
  const data = MOCK_ANALYTICS[period];

  const kpiCards = useMemo(
    () => [
      {
        label: 'Продажи',
        value: data.sales,
        meta: data.salesDelta,
        icon: TrendingUp,
        kind: 'sales' as const,
      },
      {
        label: 'Посетители',
        value: data.visitors,
        meta: data.visitorsDelta,
        icon: Users,
        kind: 'visitors' as const,
      },
      {
        label: 'Конверсия',
        value: data.conversion,
        meta: data.conversionDelta,
        icon: Percent,
        kind: 'conversion' as const,
      },
    ],
    [data],
  );

  const chartTitle =
    period === 'today'
      ? 'Продажи за сегодня'
      : period === 'week'
        ? 'Продажи за неделю'
        : 'Тренд продаж за месяц';

  return (
    <div className={shared.page}>
      <div className={shared.analyticsHeader}>
        <header className={shared.pageHeader} style={{ marginBottom: 0 }}>
          <h1 className={shared.pageTitle}>Аналитика</h1>
          <p className={shared.pageSubtitle}>Отчёты по продажам, трафику и конверсии магазина</p>
        </header>
        <div className={shared.periodToggle} role="group" aria-label="Период отчёта">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              className={`${shared.periodBtn} ${period === p ? shared.periodBtnActive : ''}`}
              onClick={() => setPeriod(p)}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      <div className={shared.kpiGrid}>
        {kpiCards.map(({ label, value, meta, icon: Icon, kind }) => (
          <article key={label} className={shared.kpiCard}>
            <span className={shared.kpiIcon} aria-hidden>
              <Icon size={22} strokeWidth={2} />
            </span>
            <p className={shared.kpiLabel}>{label}</p>
            <p className={shared.kpiValue}>{formatKpiValue(kind, value)}</p>
            <p className={shared.kpiMeta}>{meta}</p>
          </article>
        ))}
      </div>

      <section className={shared.card}>
        <h2 className={shared.cardTitle}>{chartTitle}</h2>
        <div className={shared.chartWrap}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.chart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgb(var(--color-primary-rgb) / 0.06)' }} />
              <Bar
                dataKey="revenue"
                fill={CHART_COLOR_SOFT}
                radius={[8, 8, 0, 0]}
                maxBarSize={48}
                activeBar={{ fill: CHART_COLOR }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
