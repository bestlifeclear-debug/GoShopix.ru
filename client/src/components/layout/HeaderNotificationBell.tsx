import { Link } from 'react-router-dom';
import { IconBell } from '../../design-system/icons/Icons';
import actionStyles from './MobileHeaderAction.module.css';
import styles from './HeaderNotificationBell.module.css';

interface HeaderNotificationBellProps {
  unreadCount?: number;
  variant?: 'mobile' | 'nav' | 'mobileAction';
  to?: string;
}

export function HeaderNotificationBell({
  unreadCount = 0,
  variant = 'mobile',
  to = '/account?section=notifications',
}: HeaderNotificationBellProps) {
  const hasUnread = unreadCount > 0;
  const label = hasUnread
    ? `Уведомления, ${unreadCount > 99 ? '99+' : unreadCount} непрочитанных`
    : 'Уведомления';

  if (variant === 'mobileAction') {
    return (
      <Link to={to} className={actionStyles.btn} aria-label={label}>
        <IconBell className={actionStyles.icon} strokeWidth={1.75} />
        {hasUnread && (
          <span className={actionStyles.badge} aria-hidden>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Link>
    );
  }

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
