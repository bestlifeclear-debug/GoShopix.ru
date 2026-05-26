import type { Order } from '../../../api/types';
import type { OrderArchiveItem, OrderArchiveStatus } from './types';
import { orderShortId, statusLabel } from '../utils';

function toArchiveStatus(status: Order['status']): OrderArchiveStatus {
  if (status === 'cancelled' || status === 'refunded') return 'cancelled';
  return 'delivered';
}

export function orderToArchiveItem(order: Order): OrderArchiveItem {
  const first = order.items[0];
  const label = statusLabel(order);

  return {
    id: order.id,
    orderNumber: orderShortId(order.id),
    sortAt: order.createdAt,
    date: new Date(order.createdAt).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    status: toArchiveStatus(order.status),
    statusLabel: label,
    productName: first?.productName ?? 'Заказ без позиций',
    productImageUrl: null,
    extraItemsCount: Math.max(0, order.items.length - 1),
    totalAmount: order.totalAmount,
  };
}
