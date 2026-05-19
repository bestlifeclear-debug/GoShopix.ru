import { Link } from 'react-router-dom';
import { NAV_GROUPS } from './constants';
import type { AccountSection } from './types';
import styles from '../AccountPage.module.css';

interface AccountSidebarProps {
  section: AccountSection;
  unreadCount: number;
  onNavigate: (id: AccountSection) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function AccountSidebar({
  section,
  unreadCount,
  onNavigate,
  mobileOpen,
  onCloseMobile,
}: AccountSidebarProps) {
  return (
    <>
      <button
        type="button"
        className={`${styles.sidebarBackdrop} ${mobileOpen ? styles.sidebarBackdropVisible : ''}`}
        aria-hidden={!mobileOpen}
        tabIndex={mobileOpen ? 0 : -1}
        onClick={onCloseMobile}
      />
      <aside
        className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ''}`}
        aria-label="Навигация личного кабинета"
      >
        <div className={styles.sidebarBrand}>
          <Link to="/" className={styles.sidebarLogo} onClick={onCloseMobile}>
            GoShopix
          </Link>
          <button
            type="button"
            className={styles.sidebarClose}
            aria-label="Закрыть меню"
            onClick={onCloseMobile}
          >
            ×
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          <button
            type="button"
            className={`${styles.navItem} ${section === 'dashboard' ? styles.navItemActive : ''}`}
            onClick={() => onNavigate('dashboard')}
          >
            <span className={styles.navIcon} aria-hidden>
              ⌂
            </span>
            Главная
          </button>

          {NAV_GROUPS.map((group) => (
            <div key={group.title} className={styles.navGroup}>
              <p className={styles.navGroupTitle}>{group.title}</p>
              <ul className={styles.navList}>
                {group.items.map((item) => {
                  const badge =
                    item.id === 'notifications' && unreadCount > 0 ? unreadCount : item.badge;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={`${styles.navItem} ${section === item.id ? styles.navItemActive : ''}`}
                        onClick={() => onNavigate(item.id)}
                      >
                        {item.label}
                        {badge != null && badge > 0 && (
                          <span className={styles.navBadge}>{badge > 99 ? '99+' : badge}</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
