import { Link } from 'react-router-dom';
import { IconBell } from '../../design-system/icons/Icons';
import styles from './HeaderNotificationBell.module.css';

interface HeaderNotificationBellProps {
  unreadCount?: number;
}

export function HeaderNotificationBell({ unreadCount = 0 }: HeaderNotificationBellProps) {
  const hasUnread = unreadCount > 0;
  const label = hasUnread
    ? `Уведомления, ${unreadCount > 99 ? '99+' : unreadCount} непрочитанных`
    : 'Уведомления';

  return (
    <Link to="/account?section=notifications" className={styles.root} aria-label={label}>
      <span className={styles.iconWrap}>
        <IconBell className={styles.icon} strokeWidth={1.75} />
        {hasUnread && <span className={styles.dot} aria-hidden />}
      </span>
    </Link>
  );
}
