import type { OrderArchiveItem } from './types';

/** Демо-заказы для превью архива «Мои заказы» (пока API пустой). */
export const MOCK_ARCHIVE_ORDERS: OrderArchiveItem[] = [
  {
    id: 'ord-demo-001',
    orderNumber: '48291736',
    sortAt: '2026-05-12T12:00:00.000Z',
    date: '12 мая 2026',
    status: 'delivered',
    statusLabel: 'Доставлен',
    productName: 'Беспроводные наушники SoundPro X2',
    productImageUrl:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=128&h=128&fit=crop',
    extraItemsCount: 2,
    totalAmount: 12_490,
  },
  {
    id: 'ord-demo-002',
    orderNumber: '48120344',
    sortAt: '2026-04-28T12:00:00.000Z',
    date: '28 апреля 2026',
    status: 'delivered',
    statusLabel: 'Доставлен',
    productName: 'Хлопковая футболка oversize, белая',
    productImageUrl:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=128&h=128&fit=crop',
    extraItemsCount: 0,
    totalAmount: 2_190,
  },
  {
    id: 'ord-demo-003',
    orderNumber: '47988102',
    sortAt: '2026-04-15T12:00:00.000Z',
    date: '15 апреля 2026',
    status: 'cancelled',
    statusLabel: 'Отменён',
    productName: 'Умная колонка HomeMini',
    productImageUrl: null,
    extraItemsCount: 1,
    totalAmount: 5_990,
  },
];
