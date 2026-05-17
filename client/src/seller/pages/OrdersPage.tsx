import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '@goshopix/shared';
import { Input } from '../../design-system';
import { sellerApi } from '../api/index';
import type { SellerOrder } from '../api/types';
import { DataTable, type DataTableColumn } from '../components/DataTable';
import { exportCsv } from '../components/exportCsv';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import styles from './sellerPages.module.css';

export function OrdersPage() {
  const [items, setItems] = useState<SellerOrder[]>([]);
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = useCallback(() => {
    sellerApi.orders
      .list({
        page: 1,
        limit: 100,
        status: status || undefined,
        from: from ? new Date(from).toISOString() : undefined,
        to: to ? new Date(to + 'T23:59:59').toISOString() : undefined,
      })
      .then((r) => setItems(r.items));
  }, [status, from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const columns: DataTableColumn<SellerOrder>[] = [
    {
      key: 'id',
      header: 'Заказ',
      sortable: true,
      sortValue: (r) => r.id,
      csvValue: (r) => r.id,
      render: (r) => (
        <Link className={styles.link} to={`/seller/orders/${r.id}`}>
          #{r.id.slice(0, 8)}
        </Link>
      ),
    },
    {
      key: 'status',
      header: 'Статус',
      sortable: true,
      sortValue: (r) => r.status,
      csvValue: (r) => r.status,
      render: (r) => <OrderStatusBadge status={r.status} />,
    },
    {
      key: 'revenue',
      header: 'Сумма продавца',
      sortable: true,
      sortValue: (r) => r.sellerRevenue,
      csvValue: (r) => r.sellerRevenue,
      render: (r) => formatPrice(r.sellerRevenue),
    },
    {
      key: 'created',
      header: 'Дата',
      sortable: true,
      sortValue: (r) => r.createdAt,
      csvValue: (r) => r.createdAt,
      render: (r) => new Date(r.createdAt).toLocaleString('ru-RU'),
    },
    {
      key: 'shipping',
      header: 'Адрес',
      csvValue: (r) => r.shipping.address ?? '',
      render: (r) => r.shipping.address ?? '—',
    },
  ];

  return (
    <div>
      <h1 className={styles.pageTitle}>Заказы</h1>
      <div className={styles.filters}>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Все статусы</option>
          <option value="pending">Ожидает оплаты</option>
          <option value="processing">В обработке</option>
          <option value="shipped">Отправлен</option>
          <option value="delivered">Доставлен</option>
          <option value="cancelled">Отменён</option>
          <option value="refunded">Возврат</option>
        </select>
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      <DataTable
        columns={columns}
        data={items}
        keyField={(r) => r.id}
        onExportCsv={(h, rows) => exportCsv('orders.csv', h, rows)}
      />
    </div>
  );
}
