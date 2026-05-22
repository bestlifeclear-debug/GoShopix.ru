import { formatPrice } from '@goshopix/shared';
import type { Order } from '../../api/types';
import { ProgressTracker } from '../../components/ProgressTracker';
import { Button } from '../../design-system';
import { ordersApi } from '../../api/index';
import styles from '../AccountPage.module.css';
import { orderShortId, statusLabel, statusTone } from './utils';

interface OrderExpandableRowProps {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
  onUpdated: (order: Order) => void;
  onRepeat: (order: Order) => void;
  onSupport: (orderId: string) => void;
}

export function OrderExpandableRow({
  order,
  expanded,
  onToggle,
  onUpdated,
  onRepeat,
  onSupport,
}: OrderExpandableRowProps) {
  const tone = statusTone(order.status);

  return (
    <article className={styles.orderRow}>
      <button
        type="button"
        className={styles.orderRowHead}
        aria-expanded={expanded}
        onClick={onToggle}
      >
        <div className={styles.orderRowMain}>
          <span className={styles.orderRowId}>№ {orderShortId(order.id)}</span>
          <span className={`${styles.statusDot} ${styles[`status_${tone}`]}`}>
            {statusLabel(order)}
          </span>
        </div>
        <div className={styles.orderRowMeta}>
          <time dateTime={order.createdAt}>
            {new Date(order.createdAt).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </time>
          <strong>{formatPrice(order.totalAmount)}</strong>
          <span className={styles.orderRowChevron} aria-hidden>
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </button>

      {expanded && (
        <div className={styles.orderRowBody}>
          <ProgressTracker status={order.status} history={order.history} />
          {order.tracking.number && (
            <p className={styles.tracking}>
              Трек: <strong>{order.tracking.number}</strong>
              {order.tracking.carrier && ` · ${order.tracking.carrier}`}
            </p>
          )}
          <ul className={styles.orderItemsGrid}>
            {order.items.map((item) => (
              <li key={item.id} className={styles.orderItemChip}>
                <span className={styles.orderItemThumb} aria-hidden>
                  {item.productName.charAt(0)}
                </span>
                <div>
                  <p className={styles.orderItemName}>{item.productName}</p>
                  {item.variantName && (
                    <p className={styles.orderItemVariant}>{item.variantName}</p>
                  )}
                  <p className={styles.orderItemQty}>
                    {item.quantity} × {formatPrice(item.unitPrice)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <p className={styles.orderTotal}>
            Итого: <strong>{formatPrice(order.totalAmount)}</strong>
          </p>
          <div className={styles.orderActions}>
            <Button variant="outline" size="sm" onClick={() => onRepeat(order)}>
              Повторить заказ
            </Button>
            <Button variant="secondary" size="sm" onClick={onToggle}>
              Подробнее
            </Button>
            <Button variant="outline" size="sm" onClick={() => onSupport(order.id)}>
              Связаться с поддержкой
            </Button>
            {order.status === 'pending' && (
              <Button
                size="sm"
                onClick={async () => {
                  const updated = await ordersApi.pay(order.id);
                  onUpdated(updated);
                }}
              >
                Оплатить
              </Button>
            )}
            {order.allowedTransitions.includes('cancelled') && (
              <Button
                variant="danger"
                size="sm"
                onClick={async () => {
                  const updated = await ordersApi.cancel(order.id);
                  onUpdated(updated);
                }}
              >
                Отменить
              </Button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
