import type { OrderArchiveItem } from './types';

export type OrderArchiveMonthGroup = {
  key: string;
  label: string;
  items: OrderArchiveItem[];
};

function capitalizeMonth(label: string): string {
  if (!label) return label;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function groupArchiveOrdersByMonth(orders: OrderArchiveItem[]): OrderArchiveMonthGroup[] {
  const sorted = [...orders].sort(
    (a, b) => new Date(b.sortAt).getTime() - new Date(a.sortAt).getTime(),
  );

  const map = new Map<string, OrderArchiveMonthGroup>();

  for (const order of sorted) {
    const d = new Date(order.sortAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = capitalizeMonth(
      d.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }),
    );

    const existing = map.get(key);
    if (existing) {
      existing.items.push(order);
    } else {
      map.set(key, { key, label, items: [order] });
    }
  }

  return [...map.values()];
}
