import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Order, OrderStatus } from '../../api/types';
import { showCartAddedToast, showInfoToast } from '../../stores/toastStore';
import styles from '../AccountPage.module.css';
import { filterOrdersByPeriod } from './utils';
import { OrderExpandableRow } from './OrderExpandableRow';
import { useAccountMobileLayout } from './useAccountMobileLayout';
import { MOCK_ARCHIVE_ORDERS, OrderList } from './orders/OrderList';
import { orderToArchiveItem } from './orders/orderToArchiveItem';
import type { OrderArchiveItem } from './orders/types';
import { OrdersArchiveToolbar } from './orders/OrdersArchiveToolbar';
import type { OrdersPeriod } from './orders/OrdersArchiveToolbar';
import { EmptyOrdersArchiveState } from './orders/EmptyOrdersArchiveState';
import ordersStyles from './orders/AccountOrders.module.css';

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
  onBack?: () => void;
  initialExpandedId?: string | null;
}

export function AccountOrders({
  orders,
  onOrderUpdated,
  onRepeat,
  onSupport,
  onOpenOrder,
  onBack,
  initialExpandedId,
}: AccountOrdersProps) {
  const navigate = useNavigate();
  const isCompactMobile = useAccountMobileLayout();
  const [statusFilter, setStatusFilter] = useState<'' | OrderStatus>('');
  const [period, setPeriod] = useState<OrdersPeriod>('all');
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

  const handleRepeatArchive = useCallback(
    (item: OrderArchiveItem) => {
      const order = orderById.get(item.id);
      if (order) {
        void onRepeat(order);
        return;
      }
      showCartAddedToast();
      navigate('/catalog');
    },
    [orderById, onRepeat, navigate],
  );

  const handleOpenArchive = useCallback(
    (item: OrderArchiveItem) => {
      if (orderById.has(item.id)) {
        onOpenOrder?.(item.id);
        setExpandedId(item.id);
        return;
      }
      showInfoToast('Демо-заказ: детали появятся после подключения API');
    },
    [orderById, onOpenOrder],
  );

  const resetFilters = useCallback(() => {
    setStatusFilter('');
    setPeriod('all');
    setSearch('');
  }, []);

  const showArchiveEmpty =
    archiveListItems.length === 0 && !(orders.length === 0 && filtered.length === 0);

  const useArchiveCards = isCompactMobile || filtered.length === 0;
  const listCount = archiveListItems.length;

  const desktopFilters = (
    <div className={ordersStyles.desktopFilters}>
      <label className={ordersStyles.desktopFilterField}>
        <span className={ordersStyles.desktopFilterLabel}>Статус</span>
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
      <label className={ordersStyles.desktopFilterField}>
        <span className={ordersStyles.desktopFilterLabel}>Период</span>
        <select value={period} onChange={(e) => setPeriod(e.target.value as OrdersPeriod)}>
          <option value="7d">7 дней</option>
          <option value="30d">30 дней</option>
          <option value="90d">90 дней</option>
          <option value="all">За всё время</option>
        </select>
      </label>
      <label className={`${ordersStyles.desktopFilterField} ${ordersStyles.desktopFilterSearch}`}>
        <span className={ordersStyles.desktopFilterLabel}>Поиск</span>
        <input
          type="search"
          placeholder="Номер заказа"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
    </div>
  );

  return (
    <div className={ordersStyles.root}>
      {isCompactMobile ? (
        <OrdersArchiveToolbar
          statusFilter={statusFilter}
          period={period}
          search={search}
          ordersCount={listCount > 0 && !showArchiveEmpty ? listCount : undefined}
          onBack={onBack}
          onStatusChange={setStatusFilter}
          onPeriodChange={setPeriod}
          onSearchChange={setSearch}
        />
      ) : (
        desktopFilters
      )}

      <div className={ordersStyles.listArea}>
        {showArchiveEmpty ? (
          <EmptyOrdersArchiveState onResetFilters={resetFilters} />
        ) : useArchiveCards ? (
          <OrderList
            orders={archiveListItems}
            onOpenOrder={handleOpenArchive}
            onRepeatOrder={handleRepeatArchive}
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
    </div>
  );
}
