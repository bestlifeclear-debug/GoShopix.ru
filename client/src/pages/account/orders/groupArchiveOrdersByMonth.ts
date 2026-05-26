import type { OrderArchiveItem } from './types';

export type OrderArchiveMonthGroup = {
  key: string;
  label: string;
  items: OrderArchiveItem[];
};

const MONTHS_NOMINATIVE = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
] as const;

function monthGroupLabel(d: Date): string {
  return `${MONTHS_NOMINATIVE[d.getMonth()]} ${d.getFullYear()}`;
}

export function groupArchiveOrdersByMonth(orders: OrderArchiveItem[]): OrderArchiveMonthGroup[] {
  const sorted = [...orders].sort(
    (a, b) => new Date(b.sortAt).getTime() - new Date(a.sortAt).getTime(),
  );

  const map = new Map<string, OrderArchiveMonthGroup>();

  for (const order of sorted) {
    const d = new Date(order.sortAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = monthGroupLabel(d);

    const existing = map.get(key);
    if (existing) {
      existing.items.push(order);
    } else {
      map.set(key, { key, label, items: [order] });
    }
  }

  return [...map.values()];
}
