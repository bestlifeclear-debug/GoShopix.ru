import { useCallback, useMemo, useState } from 'react';
import type { Order, OrderStatus } from '../../api/types';
import styles from '../AccountPage.module.css';
import { filterOrdersByPeriod } from './utils';
import { OrderExpandableRow } from './OrderExpandableRow';
import { useAccountMobileLayout } from './useAccountMobileLayout';
import { MOCK_ARCHIVE_ORDERS, OrderList } from './orders/OrderList';
import { orderToArchiveItem } from './orders/orderToArchiveItem';
import type { OrderArchiveItem } from './orders/types';

const STATUS_OPTIONS: { value: '' | OrderStatus; label: string }[] = [
  { value: '', label: 'Все статусы' },
  { value: 'pending', label: 'Ожидает оплаты' },
  { value: 'processing', label: 'В обработке' },
  { value: 'shipped', label: 'В пути' },
  { value: 'delivered', label: 'Доставлен' },
  { value: 'cancelled', label: 'Отменён' },
];

interface AccountOrdersProps {
  orders: Order[];
  onOrderUpdated: (order: Order) => void;
  onRepeat: (order: Order) => void;
  onSupport: (orderId: string) => void;
  onOpenOrder?: (orderId: string) => void;
  initialExpandedId?: string | null;
}

export function AccountOrders({
  orders,
  onOrderUpdated,
  onRepeat,
  onSupport,
  onOpenOrder,
  initialExpandedId,
}: AccountOrdersProps) {
  const isCompactMobile = useAccountMobileLayout();
  const [statusFilter, setStatusFilter] = useState<'' | OrderStatus>('');
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(initialExpandedId ?? null);

  const filtered = useMemo(() => {
    let list = filterOrdersByPeriod(orders, period);
    if (statusFilter) list = list.filter((o) => o.status === statusFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (o) => o.id.toLowerCase().includes(q) || o.id.slice(-8).toLowerCase().includes(q),
      );
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, period, statusFilter, search]);

  const archiveListItems = useMemo((): OrderArchiveItem[] => {
    if (filtered.length > 0) return filtered.map(orderToArchiveItem);
    if (orders.length === 0) return MOCK_ARCHIVE_ORDERS;
    return [];
  }, [filtered, orders.length]);

  const orderById = useMemo(() => new Map(orders.map((o) => [o.id, o])), [orders]);

  const handleRepeatById = useCallback(
    (orderId: string) => {
      const order = orderById.get(orderId);
      if (order) void onRepeat(order);
    },
    [orderById, onRepeat],
  );

  const handleOpenById = useCallback(
    (orderId: string) => {
      if (orderById.has(orderId)) {
        onOpenOrder?.(orderId);
        setExpandedId(orderId);
        return;
      }
      onOpenOrder?.(orderId);
    },
    [orderById, onOpenOrder],
  );

  const showArchiveEmpty =
    archiveListItems.length === 0 && !(orders.length === 0 && filtered.length === 0);

  return (
    <div className={styles.ordersSection}>
      <div className={styles.filtersBar}>
        <label className={styles.filterField}>
          <span className={styles.filterLabel}>Статус</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as '' | OrderStatus)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.filterField}>
          <span className={styles.filterLabel}>Период</span>
          <select value={period} onChange={(e) => setPeriod(e.target.value as typeof period)}>
            <option value="7d">7 дней</option>
            <option value="30d">30 дней</option>
            <option value="90d">90 дней</option>
            <option value="all">За всё время</option>
          </select>
        </label>
        <label className={`${styles.filterField} ${styles.filterSearch}`}>
          <span className={styles.filterLabel}>Поиск</span>
          <input
            type="search"
            placeholder="Номер заказа"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      {showArchiveEmpty ? (
        <p className={styles.emptyState}>Заказов по выбранным фильтрам не найдено.</p>
      ) : isCompactMobile || filtered.length === 0 ? (
        <OrderList
          orders={archiveListItems}
          onOpenOrder={handleOpenById}
          onRepeatOrder={handleRepeatById}
        />
      ) : (
        <div className={styles.orderRows}>
          {filtered.map((order) => (
            <OrderExpandableRow
              key={order.id}
              order={order}
              expanded={expandedId === order.id}
              onToggle={() => setExpandedId((id) => (id === order.id ? null : order.id))}
              onUpdated={onOrderUpdated}
              onRepeat={onRepeat}
              onSupport={onSupport}
            />
          ))}
        </div>
      )}
    </div>
  );
}
