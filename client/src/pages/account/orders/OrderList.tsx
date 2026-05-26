import { OrderCard } from './OrderCard';
import type { OrderArchiveItem } from './types';
import './orders-list.css';

export type { OrderArchiveItem } from './types';
export { MOCK_ARCHIVE_ORDERS } from './mockArchiveOrders';

type OrderListProps = {
  orders: OrderArchiveItem[];
  onOpenOrder?: (orderId: string) => void;
  onRepeatOrder?: (orderId: string) => void;
  className?: string;
};

export function OrderList({
  orders,
  onOpenOrder,
  onRepeatOrder,
  className = '',
}: OrderListProps) {
  return (
    <ul
      className={['m-0 flex list-none flex-col gap-3 p-0 pb-2', className].filter(Boolean).join(' ')}
      aria-label="Список заказов"
    >
      {orders.map((order) => (
        <li key={order.id}>
          <OrderCard order={order} onOpen={onOpenOrder} onRepeat={onRepeatOrder} />
        </li>
      ))}
    </ul>
  );
}
