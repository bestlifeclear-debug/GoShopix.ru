import { useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Bell, Package } from 'lucide-react';
import type { NotificationItem } from '../../api/types';
import { notificationsApi } from '../../api/index';
import { Button } from '../../design-system';
import styles from './AccountNotifications.module.css';

const DEMO_NOTIFICATION = {
  title: 'Заказ передан в доставку',
  body: 'Заказ № 8F2A91BC передан курьерской службе. Ожидайте SMS с номером для отслеживания.',
  when: 'Только что',
} as const;

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

interface NotificationCardProps {
  title: string;
  body: string;
  when: string;
  unread?: boolean;
  icon: LucideIcon;
  onClick?: () => void;
  demo?: boolean;
}

function NotificationCard({
  title,
  body,
  when,
  unread = false,
  icon: Icon,
  onClick,
  demo = false,
}: NotificationCardProps) {
  const content = (
    <>
      <span className={styles.iconWrap} aria-hidden>
        <Icon size={20} strokeWidth={2} />
      </span>
      <span className={styles.body}>
        <span className={styles.titleRow}>
          <span className={styles.title}>{title}</span>
          {unread && <span className={styles.badge}>Новое</span>}
        </span>
        <p className={styles.text}>{body}</p>
        <time className={styles.time}>{when}</time>
      </span>
    </>
  );

  const className = `${styles.card} ${unread ? styles.cardUnread : ''} ${demo ? styles.cardDemo : ''}`;

  if (demo || !onClick) {
    return (
      <div className={className} role={demo ? 'group' : undefined} aria-label={demo ? 'Пример уведомления' : undefined}>
        {content}
      </div>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {content}
    </button>
  );
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
      <div className={styles.wrapEmpty}>
        <div className={styles.emptyPanel}>
          <span className={styles.emptyIcon} aria-hidden>
            <Bell size={28} strokeWidth={1.75} />
          </span>
          <h2 className={styles.emptyTitle}>Уведомлений пока нет</h2>
          <p className={styles.emptyText}>
            Здесь появятся изменения статуса заказов и важные сообщения от GoShopix.
          </p>

          <div className={styles.demoBlock}>
            <span id="notif-demo-label" className={styles.demoLabel}>
              Пример уведомления
            </span>
            <NotificationCard
              demo
              unread
              icon={Package}
              title={DEMO_NOTIFICATION.title}
              body={DEMO_NOTIFICATION.body}
              when={DEMO_NOTIFICATION.when}
            />
          </div>

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
            <li key={n.id}>
              <NotificationCard
                unread={unread}
                icon={Icon}
                title={n.title}
                body={n.body}
                when={formatWhen(n.createdAt)}
                onClick={() => void handleClick(n)}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
