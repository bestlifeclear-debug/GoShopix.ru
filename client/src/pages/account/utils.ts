import { getStatusDefinition } from '@goshopix/shared';
import type { Order, OrderStatus } from '../../api/types';
import type { AccountSection } from './types';

export type StatusTone = 'processing' | 'transit' | 'delivered' | 'cancelled' | 'neutral';

export function resolveSection(params: URLSearchParams): AccountSection {
  const section = params.get('section');
  if (section) return section as AccountSection;

  const tab = params.get('tab');
  if (tab === 'orders') return 'orders';
  if (tab === 'favorites') return 'favorites';
  if (tab === 'notifications') return 'notifications';
  if (tab === 'settings') return 'profile';

  return 'dashboard';
}

export function orderShortId(id: string): string {
  return id.slice(-8).toUpperCase();
}

export function statusTone(status: OrderStatus): StatusTone {
  if (status === 'delivered') return 'delivered';
  if (status === 'shipped') return 'transit';
  if (status === 'cancelled' || status === 'refunded') return 'cancelled';
  if (status === 'pending' || status === 'processing') return 'processing';
  return 'neutral';
}

export function statusLabel(order: Order): string {
  return order.statusMeta?.name ?? getStatusDefinition(order.status)?.name ?? order.status;
}

export function isActiveOrder(order: Order): boolean {
  return !['delivered', 'cancelled', 'refunded'].includes(order.status);
}

export function filterOrdersByPeriod(orders: Order[], period: '7d' | '30d' | '90d' | 'all'): Order[] {
  if (period === 'all') return orders;
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return orders.filter((o) => new Date(o.createdAt).getTime() >= cutoff);
}
