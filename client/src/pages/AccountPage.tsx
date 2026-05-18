import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { formatPrice, getStatusDefinition } from '@goshopix/shared';
import { favoritesApi, notificationsApi, ordersApi } from '../api/index';
import type { FavoriteItem, NotificationItem, NotificationSettings, Order } from '../api/types';
import { ProgressTracker } from '../components/ProgressTracker';
import { ProductGrid } from '../components/ProductGrid';
import { Button, StatusBadge } from '../design-system';
import { useAuthStore } from '../stores/authStore';
import styles from './AccountPage.module.css';

type Tab = 'orders' | 'favorites' | 'notifications' | 'settings' | 'login';

function statusVariant(status: string): 'success' | 'warning' | 'error' | 'neutral' {
  if (status === 'cancelled') return 'error';
  if (status === 'delivered') return 'success';
  if (status === 'pending') return 'warning';
  return 'neutral';
}

export function AccountPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const tab = (params.get('tab') as Tab) || 'orders';
  const orderId = params.get('orderId');

  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifSettings, setNotifSettings] = useState<NotificationSettings | null>(null);

  useEffect(() => {
    if (token) void fetchMe();
  }, [token, fetchMe]);

  const refreshNotifications = () => {
    notificationsApi.list(1, 30).then((r) => setNotifications(r.items));
    notificationsApi.unreadCount().then((r) => setUnreadCount(r.count));
  };

  useEffect(() => {
    if (!token) return;
    if (tab === 'orders') {
      ordersApi.list(1, 20).then((r) => setOrders(r.items));
    }
    if (tab === 'favorites') {
      favoritesApi.list().then(setFavorites);
    }
    if (tab === 'notifications') {
      refreshNotifications();
    }
    if (tab === 'settings') {
      notificationsApi.getSettings().then(setNotifSettings);
    }
  }, [token, tab]);

  useEffect(() => {
    if (token) {
      notificationsApi.unreadCount().then((r) => setUnreadCount(r.count));
    }
  }, [token]);

  useEffect(() => {
    if (orderId && token) {
      ordersApi.get(orderId).then(setSelectedOrder).catch(() => {});
    }
  }, [orderId, token]);

  const setTab = (t: Tab) => {
    const next = new URLSearchParams(params);
    next.set('tab', t);
    next.delete('orderId');
    setParams(next);
  };

  const updateOrderInState = (updated: Order) => {
    setSelectedOrder(updated);
    setOrders((list) => list.map((o) => (o.id === updated.id ? updated : o)));
  };

  if (!token) {
    const returnUrl = `/account${params.toString() ? `?${params.toString()}` : ''}`;
    return <Navigate to={`/auth?returnUrl=${encodeURIComponent(returnUrl)}`} replace />;
  }


  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <h1 className={styles.title}>Личный кабинет</h1>
        <p className={styles.email}>{user?.email}</p>
        <div className={styles.headActions}>
          {user?.role === 'SELLER' && (
            <Button variant="secondary" size="sm" onClick={() => navigate('/seller/dashboard')}>
              Кабинет продавца
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={logout}>
            Выйти
          </Button>
        </div>
      </div>

      <nav className={styles.tabs}>
        {(['orders', 'favorites', 'notifications', 'settings'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`${styles.tabBtn} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'orders' && 'Мои заказы'}
            {t === 'favorites' && 'Избранное'}
            {t === 'notifications' && `Уведомления${unreadCount ? ` (${unreadCount})` : ''}`}
            {t === 'settings' && 'Настройки'}
          </button>
        ))}
      </nav>

      {tab === 'orders' && (
        <div className={styles.ordersLayout}>
          <ul className={styles.orderList}>
            {orders.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  className={`${styles.orderCard} ${selectedOrder?.id === o.id ? styles.orderActive : ''}`}
                  onClick={() => {
                    setSelectedOrder(o);
                    const next = new URLSearchParams(params);
                    next.set('orderId', o.id);
                    setParams(next);
                  }}
                >
                  <span>#{o.id.slice(-8)}</span>
                  <StatusBadge
                    variant={statusVariant(o.status)}
                    label={o.statusMeta?.name ?? getStatusDefinition(o.status)?.name ?? o.status}
                  />
                  <span>{formatPrice(o.totalAmount)}</span>
                  <span className={styles.orderDate}>
                    {new Date(o.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {selectedOrder && (
            <div className={styles.orderDetail}>
              <h2>Заказ #{selectedOrder.id.slice(-8)}</h2>
              <ProgressTracker status={selectedOrder.status} history={selectedOrder.history} />
              {selectedOrder.tracking.number && (
                <p className={styles.tracking}>
                  Трек: <strong>{selectedOrder.tracking.number}</strong>
                  {selectedOrder.tracking.carrier && ` (${selectedOrder.tracking.carrier})`}
                </p>
              )}
              <ul className={styles.orderItems}>
                {selectedOrder.items.map((i) => (
                  <li key={i.id}>
                    {i.productName}
                    {i.variantName && ` (${i.variantName})`} × {i.quantity} — {formatPrice(i.lineTotal)}
                  </li>
                ))}
              </ul>
              <p>
                <strong>Итого:</strong> {formatPrice(selectedOrder.totalAmount)}
              </p>
              <div className={styles.orderActions}>
                {selectedOrder.status === 'pending' && (
                  <Button
                    size="sm"
                    onClick={async () => {
                      const updated = await ordersApi.pay(selectedOrder.id);
                      updateOrderInState(updated);
                      refreshNotifications();
                    }}
                  >
                    Оплатить (демо)
                  </Button>
                )}
                {selectedOrder.allowedTransitions.includes('cancelled') && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={async () => {
                      const updated = await ordersApi.cancel(selectedOrder.id);
                      updateOrderInState(updated);
                    }}
                  >
                    Отменить заказ
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'favorites' && (
        <ProductGrid products={favorites.map((f) => f.product)} onAddToCart={() => navigate('/catalog')} />
      )}

      {tab === 'notifications' && (
        <div className={styles.notifications}>
          <div className={styles.notifToolbar}>
            <Button variant="outline" size="sm" onClick={() => void notificationsApi.markAllRead().then(refreshNotifications)}>
              Прочитать все
            </Button>
          </div>
          <ul className={styles.notifList}>
            {notifications.map((n) => (
              <li key={n.id} className={n.readAt ? styles.notifRead : styles.notifUnread}>
                <button
                  type="button"
                  className={styles.notifItem}
                  onClick={async () => {
                    if (!n.readAt) await notificationsApi.markRead(n.id);
                    if (n.data?.orderId) {
                      const next = new URLSearchParams(params);
                      next.set('tab', 'orders');
                      next.set('orderId', n.data.orderId);
                      setParams(next);
                    }
                    refreshNotifications();
                  }}
                >
                  <strong>{n.title}</strong>
                  <p>{n.body}</p>
                  <time>{new Date(n.createdAt).toLocaleString('ru-RU')}</time>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'settings' && (
        <div className={styles.settings}>
          <p>
            <strong>Логин:</strong> {user?.profile?.username ?? '—'}
          </p>
          <p>
            <strong>Имя:</strong>{' '}
            {[user?.profile?.firstName, user?.profile?.lastName].filter(Boolean).join(' ') || '—'}
          </p>
          <p>
            <strong>Телефон:</strong> {user?.profile?.phone ?? '—'}
          </p>
          {notifSettings && (
            <fieldset className={styles.notifFieldset}>
              <legend>Уведомления о заказах</legend>
              <label>
                <input
                  type="checkbox"
                  checked={notifSettings.emailOrderStatus}
                  onChange={(e) =>
                    setNotifSettings({ ...notifSettings, emailOrderStatus: e.target.checked })
                  }
                />{' '}
                Email при смене статуса
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={notifSettings.inAppOrderStatus}
                  onChange={(e) =>
                    setNotifSettings({ ...notifSettings, inAppOrderStatus: e.target.checked })
                  }
                />{' '}
                In-app уведомления
              </label>
              <Button
                size="sm"
                onClick={() =>
                  notificationsApi.updateSettings(notifSettings).then(setNotifSettings)
                }
              >
                Сохранить
              </Button>
            </fieldset>
          )}
          <Link to="/cart">
            <Button variant="outline">Перейти в корзину</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
