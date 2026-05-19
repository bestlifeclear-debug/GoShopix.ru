/** Демо-данные дашборда продавца (фронт без бэкенда). */

export interface DashboardChartPoint {
  period: string;
  revenue: number;
  orderCount: number;
}

export interface DashboardRecentOrder {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: 'delivered' | 'shipped' | 'processing' | 'pending';
  statusLabel: string;
}

export interface DashboardLowStockItem {
  variantId: string;
  productName: string;
  sku: string;
  stock: number;
  maxStock: number;
}

export const MOCK_METRICS = {
  today: { revenue: 45_890, orders: 12 },
  week: { revenue: 312_400, orders: 87 },
  month: { revenue: 1_245_800, orders: 342 },
} as const;

export const MOCK_CHART: DashboardChartPoint[] = [
  { period: '06 мая', revenue: 38_200, orderCount: 9 },
  { period: '07 мая', revenue: 52_400, orderCount: 14 },
  { period: '08 мая', revenue: 41_100, orderCount: 11 },
  { period: '09 мая', revenue: 67_800, orderCount: 18 },
  { period: '10 мая', revenue: 59_300, orderCount: 15 },
  { period: '11 мая', revenue: 44_600, orderCount: 12 },
  { period: '12 мая', revenue: 71_200, orderCount: 19 },
  { period: '13 мая', revenue: 63_500, orderCount: 17 },
  { period: '14 мая', revenue: 48_900, orderCount: 13 },
  { period: '15 мая', revenue: 55_700, orderCount: 16 },
  { period: '16 мая', revenue: 78_400, orderCount: 21 },
  { period: '17 мая', revenue: 69_100, orderCount: 18 },
  { period: '18 мая', revenue: 82_300, orderCount: 22 },
  { period: '19 мая', revenue: 45_890, orderCount: 12 },
];

export const MOCK_RECENT_ORDERS: DashboardRecentOrder[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    number: 'GS-10482',
    date: '19 мая, 14:32',
    amount: 12_490,
    status: 'delivered',
    statusLabel: 'Доставлен',
  },
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    number: 'GS-10479',
    date: '19 мая, 11:05',
    amount: 8_750,
    status: 'shipped',
    statusLabel: 'В пути',
  },
  {
    id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    number: 'GS-10475',
    date: '18 мая, 19:48',
    amount: 24_300,
    status: 'processing',
    statusLabel: 'Сборка',
  },
  {
    id: 'd4e5f6a7-b8c9-0123-def0-234567890123',
    number: 'GS-10471',
    date: '18 мая, 09:15',
    amount: 5_990,
    status: 'pending',
    statusLabel: 'Новый',
  },
];

export const MOCK_LOW_STOCK: DashboardLowStockItem[] = [
  {
    variantId: 'v1',
    productName: 'Наушники SoundWave Pro',
    sku: 'SWP-BLK',
    stock: 2,
    maxStock: 48,
  },
  {
    variantId: 'v2',
    productName: 'Куртка Urban Wind M',
    sku: 'UWW-M-GR',
    stock: 1,
    maxStock: 32,
  },
  {
    variantId: 'v3',
    productName: 'Рюкзак City Pack 25L',
    sku: 'CP25-RED',
    stock: 4,
    maxStock: 60,
  },
  {
    variantId: 'v4',
    productName: 'Смартфон GoPhone X 128GB',
    sku: 'GPX-128',
    stock: 3,
    maxStock: 24,
  },
];
