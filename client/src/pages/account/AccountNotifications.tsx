import { useMemo } from 'react';
import { Bell, Package } from 'lucide-react';
import type { NotificationItem } from '../../api/types';
import { notificationsApi } from '../../api/index';
import { Button } from '../../design-system';
import styles from './AccountNotifications.module.css';

interface AccountNotificationsProps {
  notifications: NotificationItem[];
  onRefresh: () => void;
  onOpenOrder: (orderId: string) => void;
  onGoOrders?: () => void;
}

function formatWhen(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return 'Только что';
  if (diffMin < 60) return `${diffMin} мин назад`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} ч назад`;
  return date.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AccountNotifications({
  notifications,
  onRefresh,
  onOpenOrder,
  onGoOrders,
}: AccountNotificationsProps) {
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.readAt).length,
    [notifications],
  );

  const handleClick = async (n: NotificationItem) => {
    if (!n.readAt) await notificationsApi.markRead(n.id);
    if (n.data?.orderId) onOpenOrder(n.data.orderId);
    onRefresh();
  };

  if (notifications.length === 0) {
    return (
      <div className={styles.wrap}>
        <div className={styles.empty}>
          <span className={styles.emptyIcon} aria-hidden>
            <Bell size={28} strokeWidth={1.75} />
          </span>
          <h2 className={styles.emptyTitle}>Уведомлений пока нет</h2>
          <p className={styles.emptyText}>
            Здесь появятся изменения статуса заказов и важные сообщения от GoShopix.
          </p>
          {onGoOrders && (
            <Button variant="outline" size="sm" onClick={onGoOrders}>
              Перейти к заказам
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <p className={styles.summary}>
          {unreadCount > 0
            ? `${unreadCount} непрочитанных из ${notifications.length}`
            : `Все ${notifications.length} прочитаны`}
        </p>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => void notificationsApi.markAllRead().then(onRefresh)}
          >
            Прочитать все
          </Button>
        )}
      </div>

      <ul className={styles.list}>
        {notifications.map((n) => {
          const unread = !n.readAt;
          const isOrder = n.type.includes('order') || Boolean(n.data?.orderId);
          const Icon = isOrder ? Package : Bell;

          return (
            <li key={n.id} className={unread ? styles.itemUnread : undefined}>
              <button type="button" className={styles.itemBtn} onClick={() => void handleClick(n)}>
                <span className={styles.iconWrap} aria-hidden>
                  <Icon size={20} strokeWidth={2} />
                </span>
                <span className={styles.body}>
                  <span className={styles.titleRow}>
                    <span className={styles.title}>{n.title}</span>
                    {unread && <span className={styles.badge}>Новое</span>}
                  </span>
                  <p className={styles.text}>{n.body}</p>
                  <time className={styles.time} dateTime={n.createdAt}>
                    {formatWhen(n.createdAt)}
                  </time>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
