import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '@goshopix/shared';
import {
  MOCK_ORDERS,
  ORDER_STATUS_FILTER_OPTIONS,
  type MockOrderStatus,
  type MockSellerOrder,
} from './orders/mockData';
import shared from './shared/sellerPremium.module.css';
import styles from './OrdersPage.module.css';

function statusClass(status: MockOrderStatus) {
  const map = {
    delivered: shared.statusDelivered,
    shipped: shared.statusShipped,
    processing: shared.statusProcessing,
    pending: shared.statusPending,
  } as const;
  return map[status];
}

function matchesDate(order: MockSellerOrder, from: string, to: string) {
  if (from && order.dateIso < from) return false;
  if (to && order.dateIso > to) return false;
  return true;
}

export function OrdersPage() {
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const filtered = useMemo(
    () =>
      MOCK_ORDERS.filter((order) => {
        if (status && order.status !== status) return false;
        return matchesDate(order, from, to);
      }),
    [status, from, to],
  );

  return (
    <div className={shared.page}>
      <header className={shared.pageHeader}>
        <h1 className={shared.pageTitle}>Заказы</h1>
        <p className={shared.pageSubtitle}>Управление заказами и статусами доставки</p>
      </header>

      <div className={shared.toolbarCard}>
        <select
          className={shared.filterSelect}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Статус заказа"
        >
          {ORDER_STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value || 'all'} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <input
          type="date"
          className={shared.dateInput}
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          aria-label="Дата от"
        />
        <input
          type="date"
          className={shared.dateInput}
          value={to}
          onChange={(e) => setTo(e.target.value)}
          aria-label="Дата до"
        />
      </div>

      <div className={shared.tableCard}>
        <table className={shared.dataTable}>
          <thead>
            <tr>
              <th>Заказ</th>
              <th>Статус</th>
              <th>Сумма</th>
              <th>Клиент</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr className={shared.emptyRow}>
                <td colSpan={4}>Заказы не найдены</td>
              </tr>
            ) : (
              filtered.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link className={styles.orderLink} to={`/seller/orders/${order.id}`}>
                      {order.number}
                    </Link>
                    <span className={styles.orderDate}>{order.date}</span>
                  </td>
                  <td>
                    <span className={`${shared.statusBadge} ${statusClass(order.status)}`}>
                      {order.statusLabel}
                    </span>
                  </td>
                  <td className={styles.amountCell}>{formatPrice(order.amount)}</td>
                  <td>
                    <p className={styles.customerName}>{order.customerName}</p>
                    <p className={styles.customerAddress}>{order.customerAddress}</p>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
