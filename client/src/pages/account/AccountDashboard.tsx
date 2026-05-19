import { Link } from 'react-router-dom';
import { formatPrice } from '@goshopix/shared';
import type { FavoriteItem, Order, ProductListItem } from '../../api/types';
import { Button } from '../../design-system';
import styles from '../AccountPage.module.css';
import { isActiveOrder, orderShortId, statusLabel, statusTone } from './utils';
import type { AccountSection } from './types';

interface AccountDashboardProps {
  orders: Order[];
  favorites: FavoriteItem[];
  recommendations: ProductListItem[];
  bonusBalance: number;
  onNavigate: (section: AccountSection) => void;
  onOpenOrder: (orderId: string) => void;
}

export function AccountDashboard({
  orders,
  favorites,
  recommendations,
  bonusBalance,
  onNavigate,
  onOpenOrder,
}: AccountDashboardProps) {
  const activeOrders = orders.filter(isActiveOrder).slice(0, 3);
  const favPreview = favorites.slice(0, 4);

  return (
    <div className={styles.dashboard}>
      <section className={`${styles.widget} ${styles.widgetWide}`} aria-labelledby="widget-orders">
        <div className={styles.widgetHead}>
          <h2 id="widget-orders" className={styles.widgetTitle}>
            Активные заказы
          </h2>
          <button type="button" className={styles.widgetLink} onClick={() => onNavigate('orders')}>
            Все заказы →
          </button>
        </div>
        {activeOrders.length === 0 ? (
          <p className={styles.widgetEmpty}>Нет активных заказов. Загляните в каталог!</p>
        ) : (
          <ul className={styles.activeOrdersList}>
            {activeOrders.map((order) => {
              const tone = statusTone(order.status);
              return (
                <li key={order.id}>
                  <article className={styles.activeOrderCard}>
                    <div className={styles.activeOrderTop}>
                      <span className={styles.activeOrderId}>№ {orderShortId(order.id)}</span>
                      <span className={`${styles.statusDot} ${styles[`status_${tone}`]}`}>
                        {statusLabel(order)}
                      </span>
                    </div>
                    <p className={styles.activeOrderDate}>
                      {new Date(order.createdAt).toLocaleDateString('ru-RU')} ·{' '}
                      <strong>{formatPrice(order.totalAmount)}</strong>
                    </p>
                    <div className={styles.activeOrderActions}>
                      <Button size="sm" variant="outline" onClick={() => onOpenOrder(order.id)}>
                        Подробнее
                      </Button>
                      <Button size="sm" onClick={() => onNavigate('support')}>
                        Поддержка
                      </Button>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className={styles.widget} aria-labelledby="widget-bonus">
        <h2 id="widget-bonus" className={styles.widgetTitle}>
          Баланс бонусов
        </h2>
        <p className={styles.bonusValue}>{bonusBalance.toLocaleString('ru-RU')}</p>
        <p className={styles.bonusHint}>бонусов на счёте</p>
        <button type="button" className={styles.widgetLink} onClick={() => onNavigate('finance')}>
          Как потратить →
        </button>
      </section>

      <section
        className={`${styles.widget} ${styles.widgetWide}`}
        aria-labelledby="widget-reco"
      >
        <div className={styles.widgetHead}>
          <h2 id="widget-reco" className={styles.widgetTitle}>
            Персональные рекомендации
          </h2>
          <Link to="/catalog" className={styles.widgetLink}>
            Каталог →
          </Link>
        </div>
        <div className={styles.carousel}>
          {recommendations.length === 0 ? (
            <p className={styles.widgetEmpty}>Скоро подберём товары специально для вас.</p>
          ) : (
            recommendations.map((p) => (
              <Link key={p.id} to={`/product/${p.id}`} className={styles.carouselCard}>
                <span className={styles.carouselImg}>
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt="" loading="lazy" />
                  ) : (
                    <span>{p.name.charAt(0)}</span>
                  )}
                </span>
                <span className={styles.carouselName}>{p.name}</span>
                <span className={styles.carouselPrice}>{formatPrice(p.price)}</span>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className={styles.widget} aria-labelledby="widget-fav">
        <div className={styles.widgetHead}>
          <h2 id="widget-fav" className={styles.widgetTitle}>
            Избранное
          </h2>
          <button type="button" className={styles.widgetLink} onClick={() => onNavigate('favorites')}>
            Всё избранное →
          </button>
        </div>
        {favPreview.length === 0 ? (
          <p className={styles.widgetEmpty}>Добавляйте товары в избранное с карточки товара.</p>
        ) : (
          <ul className={styles.favPreview}>
            {favPreview.map((f) => (
              <li key={f.id}>
                <Link to={`/product/${f.productId}`} className={styles.favPreviewItem}>
                  <span className={styles.favPreviewThumb}>
                    {f.product.imageUrl ? (
                      <img src={f.product.imageUrl} alt="" loading="lazy" />
                    ) : (
                      f.product.name.charAt(0)
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
