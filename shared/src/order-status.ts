export const ORDER_STATUSES = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
] as const;

export type OrderStatusSlug = (typeof ORDER_STATUSES)[number];

export interface OrderStatusDefinition {
  slug: OrderStatusSlug;
  name: string;
  description: string;
  color: string;
  sortOrder: number;
  icon: string;
}

export const ORDER_STATUS_DEFINITIONS: OrderStatusDefinition[] = [
  {
    slug: 'pending',
    name: 'Ожидает оплаты',
    description: 'Заказ создан и ожидает подтверждения оплаты',
    color: '#F59E0B',
    sortOrder: 1,
    icon: 'clock',
  },
  {
    slug: 'processing',
    name: 'В обработке',
    description: 'Оплата получена, заказ собирается',
    color: '#3B82F6',
    sortOrder: 2,
    icon: 'package',
  },
  {
    slug: 'shipped',
    name: 'Отправлен',
    description: 'Заказ передан в службу доставки',
    color: '#8B5CF6',
    sortOrder: 3,
    icon: 'truck',
  },
  {
    slug: 'delivered',
    name: 'Доставлен',
    description: 'Заказ получен покупателем',
    color: '#10B981',
    sortOrder: 4,
    icon: 'check-circle',
  },
  {
    slug: 'cancelled',
    name: 'Отменён',
    description: 'Заказ отменён',
    color: '#EF4444',
    sortOrder: 5,
    icon: 'x-circle',
  },
  {
    slug: 'refunded',
    name: 'Возврат',
    description: 'Средства возвращены покупателю',
    color: '#6B7280',
    sortOrder: 6,
    icon: 'rotate-ccw',
  },
];

export const PROGRESS_STATUSES: OrderStatusSlug[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
];

export function getStatusDefinition(slug: string): OrderStatusDefinition | undefined {
  return ORDER_STATUS_DEFINITIONS.find((s) => s.slug === slug);
}
