import { Link } from 'react-router-dom';
import type { AccountSection } from './types';
import { SIDEBAR_NAV_MAIN } from './constants';
import { IconStore } from './AccountIcons';
import styles from '../AccountPage.module.css';

interface AccountSidebarProps {
  section: AccountSection;
  unreadCount: number;
  userEmail?: string;
  isSeller?: boolean;
  onNavigate: (id: AccountSection) => void;
  onLogout: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function AccountSidebar({
  section,
  unreadCount,
  userEmail,
  isSeller,
  onNavigate,
  onLogout,
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
        aria-label="Меню личного кабинета"
      >
        <div className={styles.sidebarHead}>
          <p className={styles.sidebarTitle}>Личный кабинет</p>
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
          <ul className={styles.navList}>
            {SIDEBAR_NAV_MAIN.map((item) => {
              const Icon = item.icon;
              const badge = item.id === 'notifications' && unreadCount > 0 ? unreadCount : undefined;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    data-lk-nav
                    data-active={section === item.id ? 'true' : undefined}
                    className={`${styles.navItem} ${section === item.id ? styles.navItemActive : ''}`}
                    onClick={() => onNavigate(item.id)}
                  >
                    <span className={styles.navIconWrap} data-lk-nav-icon>
                      <Icon />
                    </span>
                    <span className={styles.navLabel}>{item.label}</span>
                    {badge != null && (
                      <span className={styles.navBadge}>{badge > 99 ? '99+' : badge}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {isSeller && (
          <div className={styles.sellerCabinetBlock}>
            <Link
              to="/seller/dashboard"
              className={styles.sellerCabinetLink}
              data-lk-seller-cabinet
              onClick={onCloseMobile}
            >
              <span className={styles.sellerCabinetIcon} aria-hidden>
                <IconStore />
              </span>
              <span>Кабинет продавца</span>
            </Link>
          </div>
        )}

        <footer className={styles.sidebarFooter}>
          {userEmail && (
            <p className={styles.sidebarEmail} data-lk-footer-email>
              {userEmail}
            </p>
          )}
          <button type="button" className={styles.logoutBtn} data-lk-logout onClick={onLogout}>
            Выйти
          </button>
        </footer>
      </aside>
    </>
  );
}
