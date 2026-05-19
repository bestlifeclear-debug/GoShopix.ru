/** Демо-данные аналитики продавца. */

export type AnalyticsPeriod = 'today' | 'week' | 'month';

export interface AnalyticsChartPoint {
  period: string;
  revenue: number;
  orderCount: number;
}

export interface AnalyticsPeriodData {
  sales: number;
  salesDelta: string;
  visitors: number;
  visitorsDelta: string;
  conversion: number;
  conversionDelta: string;
  chart: AnalyticsChartPoint[];
}

export const MOCK_ANALYTICS: Record<AnalyticsPeriod, AnalyticsPeriodData> = {
  today: {
    sales: 45_890,
    salesDelta: '+12% к вчера',
    visitors: 1_284,
    visitorsDelta: '+8%',
    conversion: 3.4,
    conversionDelta: '+0.2 п.п.',
    chart: [
      { period: '08:00', revenue: 2_100, orderCount: 1 },
      { period: '10:00', revenue: 4_800, orderCount: 2 },
      { period: '12:00', revenue: 8_200, orderCount: 3 },
      { period: '14:00', revenue: 12_490, orderCount: 4 },
      { period: '16:00', revenue: 9_300, orderCount: 2 },
      { period: '18:00', revenue: 6_500, orderCount: 2 },
      { period: '20:00', revenue: 2_500, orderCount: 1 },
    ],
  },
  week: {
    sales: 312_400,
    salesDelta: '+18% к прошлой неделе',
    visitors: 8_920,
    visitorsDelta: '+14%',
    conversion: 3.1,
    conversionDelta: '+0.4 п.п.',
    chart: [
      { period: 'Пн', revenue: 38_200, orderCount: 9 },
      { period: 'Вт', revenue: 52_400, orderCount: 14 },
      { period: 'Ср', revenue: 41_100, orderCount: 11 },
      { period: 'Чт', revenue: 67_800, orderCount: 18 },
      { period: 'Пт', revenue: 59_300, orderCount: 15 },
      { period: 'Сб', revenue: 44_600, orderCount: 12 },
      { period: 'Вс', revenue: 9_000, orderCount: 8 },
    ],
  },
  month: {
    sales: 1_245_800,
    salesDelta: '+24% к прошлому месяцу',
    visitors: 34_560,
    visitorsDelta: '+21%',
    conversion: 2.9,
    conversionDelta: '+0.3 п.п.',
    chart: [
      { period: '01 мая', revenue: 32_100, orderCount: 8 },
      { period: '05 мая', revenue: 48_900, orderCount: 13 },
      { period: '09 мая', revenue: 67_800, orderCount: 18 },
      { period: '13 мая', revenue: 63_500, orderCount: 17 },
      { period: '17 мая', revenue: 78_400, orderCount: 21 },
      { period: '19 мая', revenue: 45_890, orderCount: 12 },
      { period: '22 мая', revenue: 82_300, orderCount: 22 },
      { period: '26 мая', revenue: 71_200, orderCount: 19 },
      { period: '30 мая', revenue: 89_400, orderCount: 24 },
    ],
  },
};

export const PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  today: 'Сегодня',
  week: 'Неделя',
  month: 'Месяц',
};
