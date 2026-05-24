import { Link } from 'react-router-dom';
import type { AccountSection } from './types';
import { SIDEBAR_NAV_MAIN } from './constants';
import { IconStore } from './AccountIcons';
import { AccountLogoutIcon } from './AccountLogoutButton';
import { useAccountMobileLayout } from './useAccountMobileLayout';
import styles from '../AccountPage.module.css';

interface AccountSidebarProps {
  section: AccountSection;
  unreadCount: number;
  userEmail?: string;
  isSeller?: boolean;
  onNavigate: (id: AccountSection) => void;
  onLogout: () => void;
}

export function AccountSidebar({
  section,
  unreadCount,
  userEmail,
  isSeller,
  onNavigate,
  onLogout,
}: AccountSidebarProps) {
  const isCompactMobile = useAccountMobileLayout();

  if (isCompactMobile) {
    return null;
  }

  return (
    <div className={styles.sidebarHost}>
      <aside className={styles.sidebar} aria-label="Меню личного кабинета">
        <div className={styles.sidebarHead}>
          <p className={styles.sidebarTitle}>Личный кабинет</p>
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
            <Link to="/seller/dashboard" className={styles.sellerCabinetLink} data-lk-seller-cabinet>
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
          <button
            type="button"
            className={styles.sidebarLogoutBtn}
            onClick={onLogout}
            data-lk-logout
            data-testid="account-sidebar-logout"
          >
            <span className={styles.sidebarLogoutLabel}>Выйти</span>
            <AccountLogoutIcon className={styles.sidebarLogoutIcon} variant="white" />
          </button>
        </footer>
      </aside>
    </div>
  );
}
