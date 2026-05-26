import { useMemo } from 'react';
import { OrderCard } from './OrderCard';
import { groupArchiveOrdersByMonth } from './groupArchiveOrdersByMonth';
import type { OrderArchiveItem } from './types';
import './orders-list.css';

export type { OrderArchiveItem } from './types';
export { MOCK_ARCHIVE_ORDERS } from './mockArchiveOrders';

type OrderListProps = {
  orders: OrderArchiveItem[];
  onOpenOrder?: (order: OrderArchiveItem) => void;
  onRepeatOrder?: (order: OrderArchiveItem) => void;
  className?: string;
};

export function OrderList({
  orders,
  onOpenOrder,
  onRepeatOrder,
  className = '',
}: OrderListProps) {
  const monthGroups = useMemo(() => groupArchiveOrdersByMonth(orders), [orders]);

  return (
    <ul
      className={['m-0 flex list-none flex-col gap-4 p-0 pb-2', className].filter(Boolean).join(' ')}
      aria-label="Список заказов"
    >
      {monthGroups.map((group) => (
        <li key={group.key} className="flex flex-col gap-3">
          <p className="orders-archive-month m-0 px-0.5 text-gray-500">{group.label}</p>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {group.items.map((order) => (
              <li key={order.id}>
                <OrderCard order={order} onOpen={onOpenOrder} onRepeat={onRepeatOrder} />
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
