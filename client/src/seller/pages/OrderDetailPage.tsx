import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatPrice } from '@goshopix/shared';
import { Button } from '../../design-system';
import { sellerApi } from '../api/index';
import type { SellerOrderDetail } from '../api/types';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import styles from './sellerPages.module.css';

export function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<SellerOrderDetail | null>(null);
  const [nextStatus, setNextStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!id) return;
    sellerApi.orders.get(id).then((o) => {
      setOrder(o);
      setNextStatus(o.allowedStatusTransitions[0] ?? '');
    });
  };

  useEffect(() => {
    load();
  }, [id]);

  const updateStatus = async () => {
    if (!id || !nextStatus) return;
    setSaving(true);
    try {
      await sellerApi.orders.updateStatus(id, nextStatus);
      load();
    } finally {
      setSaving(false);
    }
  };

  const print = () => window.print();

  if (!order) return <p>Загрузка…</p>;

  return (
    <div>
      <div className={`${styles.rowActions} ${styles.noPrint}`}>
        <Link className={styles.link} to="/seller/orders">
          ← К списку
        </Link>
        <Button variant="outline" onClick={print}>
          Печать
        </Button>
      </div>

      <div className={styles.printArea}>
        <h1 className={styles.pageTitle}>Заказ #{order.id.slice(0, 8)}</h1>
        <p>
          <OrderStatusBadge status={order.status} /> · {new Date(order.createdAt).toLocaleString('ru-RU')}
        </p>
        {order.multiSeller && (
          <p>Заказ содержит товары других продавцов — смена статуса недоступна.</p>
        )}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Доставка</h2>
          <p>{order.shipping.name}</p>
          <p>{order.shipping.phone}</p>
          <p>{order.shipping.address}</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Позиции</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Товар</th>
                <th>Кол-во</th>
                <th>Цена</th>
                <th>Сумма</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((i) => (
                <tr key={i.id}>
                  <td>
                    {i.productName}
                    {i.variantName ? ` (${i.variantName})` : ''}
                  </td>
                  <td>{i.quantity}</td>
                  <td>{formatPrice(i.unitPrice)}</td>
                  <td>{formatPrice(i.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            <strong>Итого продавца:</strong> {formatPrice(order.sellerRevenue)}
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>История</h2>
          <ul>
            {order.history.map((h) => (
              <li key={h.id}>
                {new Date(h.createdAt).toLocaleString('ru-RU')} — {h.status}
                {h.note ? `: ${h.note}` : ''}
              </li>
            ))}
          </ul>
        </section>

        {!order.multiSeller && order.allowedStatusTransitions.length > 0 && (
          <section className={`${styles.section} ${styles.noPrint}`}>
            <h2 className={styles.sectionTitle}>Сменить статус</h2>
            <div className={styles.filters}>
              <select value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}>
                {order.allowedStatusTransitions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <Button loading={saving} onClick={updateStatus}>
                Применить
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
