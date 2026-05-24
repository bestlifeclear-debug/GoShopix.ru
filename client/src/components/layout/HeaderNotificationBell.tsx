import { Link } from 'react-router-dom';
import { IconBell } from '../../design-system/icons/Icons';
import styles from './HeaderNotificationBell.module.css';

interface HeaderNotificationBellProps {
  unreadCount?: number;
  variant?: 'mobile' | 'nav';
}

export function HeaderNotificationBell({
  unreadCount = 0,
  variant = 'mobile',
}: HeaderNotificationBellProps) {
  const hasUnread = unreadCount > 0;
  const label = hasUnread
    ? `Уведомления, ${unreadCount > 99 ? '99+' : unreadCount} непрочитанных`
    : 'Уведомления';

  return (
    <Link
      to="/account?section=notifications"
      className={`${styles.root} ${variant === 'nav' ? styles.rootNav : ''}`}
      aria-label={label}
    >
      <span className={styles.iconWrap}>
        <IconBell className={styles.icon} strokeWidth={1.75} />
        {hasUnread && <span className={styles.dot} aria-hidden />}
      </span>
    </Link>
  );
}
