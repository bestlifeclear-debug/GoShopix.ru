import { Link } from 'react-router-dom';
import { formatPrice } from '@goshopix/shared';
import type { Order, ProductListItem } from '../../api/types';
import { Button } from '../../design-system';
import styles from '../AccountPage.module.css';
import { isActiveOrder, orderShortId, statusLabel, statusTone } from './utils';

interface AccountDashboardProps {
  displayName: string;
  orders: Order[];
  recommendations: ProductListItem[];
  onOpenOrder: (orderId: string) => void;
  onAllOrders: () => void;
}

export function AccountDashboard({
  displayName,
  orders,
  recommendations,
  onOpenOrder,
  onAllOrders,
}: AccountDashboardProps) {
  const activeOrders = orders.filter(isActiveOrder).slice(0, 3);

  return (
    <div className={styles.dashboard}>
      <section className={styles.welcomeBlock} aria-labelledby="welcome-title">
        <h1 id="welcome-title" className={styles.welcomeTitle}>
          Добро пожаловать, {displayName}
        </h1>

        <div className={styles.ordersBlock}>
          <h2 className={styles.blockSubtitle}>Активные заказы</h2>
          {activeOrders.length === 0 ? (
            <div className={styles.emptyOrders}>
              <p className={styles.emptyOrdersText}>
                У вас пока нет активных заказов. Самое время выбрать что-нибудь в каталоге!
              </p>
              <Link to="/catalog">
                <Button>Перейти в каталог</Button>
              </Link>
            </div>
          ) : (
            <>
              <ul className={styles.activeOrdersList}>
                {activeOrders.map((order) => {
                  const tone = statusTone(order.status);
                  return (
                    <li key={order.id}>
                      <button
                        type="button"
                        data-lk-order-card
                        className={styles.activeOrderCard}
                        onClick={() => onOpenOrder(order.id)}
                      >
                        <span className={styles.activeOrderId}>№ {orderShortId(order.id)}</span>
                        <span className={`${styles.statusDot} ${styles[`status_${tone}`]}`}>
                          {statusLabel(order)}
                        </span>
                        <span className={styles.activeOrderMeta}>
                          {new Date(order.createdAt).toLocaleDateString('ru-RU')} ·{' '}
                          {formatPrice(order.totalAmount)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <button type="button" className={styles.textLink} onClick={onAllOrders}>
                Все заказы
              </button>
            </>
          )}
        </div>
      </section>

      <section className={styles.recoBlock} aria-labelledby="reco-title">
        <div className={styles.recoHead}>
          <h2 id="reco-title" className={styles.blockSubtitle}>
            Персональные рекомендации
          </h2>
          <Link to="/catalog" className={styles.textLink}>
            Весь каталог
          </Link>
        </div>
        {recommendations.length === 0 ? (
          <p className={styles.recoEmpty}>Рекомендации появятся после просмотра каталога.</p>
        ) : (
          <ul className={styles.recoGrid}>
            {recommendations.map((p) => (
              <li key={p.id}>
                <Link to={`/product/${p.id}`} className={styles.recoCard} data-lk-reco>
                  <span className={styles.recoImg}>
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt="" loading="lazy" />
                    ) : (
                      <span className={styles.recoImgFallback}>{p.name.charAt(0)}</span>
                    )}
                  </span>
                  <span className={styles.recoName}>{p.name}</span>
                  <span className={styles.recoPrice}>{formatPrice(p.price)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
