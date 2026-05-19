import type { NotificationItem } from '../../api/types';
import { notificationsApi } from '../../api/index';
import { Button } from '../../design-system';
import styles from '../AccountPage.module.css';

interface AccountNotificationsProps {
  notifications: NotificationItem[];
  onRefresh: () => void;
  onOpenOrder: (orderId: string) => void;
}

export function AccountNotifications({
  notifications,
  onRefresh,
  onOpenOrder,
}: AccountNotificationsProps) {
  return (
    <div className={styles.notifications}>
      <div className={styles.notifToolbar}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void notificationsApi.markAllRead().then(onRefresh)}
        >
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
                if (n.data?.orderId) onOpenOrder(n.data.orderId);
                onRefresh();
              }}
            >
              <strong>{n.title}</strong>
              <p>{n.body}</p>
              <time dateTime={n.createdAt}>
                {new Date(n.createdAt).toLocaleString('ru-RU')}
              </time>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
