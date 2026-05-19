import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Store,
  ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import styles from './SellerLayout.module.css';

const links = [
  { to: '/seller/dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { to: '/seller/products', label: 'Товары', icon: Package },
  { to: '/seller/orders', label: 'Заказы', icon: ShoppingBag },
  { to: '/seller/analytics', label: 'Аналитика', icon: BarChart3 },
  { to: '/seller/settings', label: 'Настройки', icon: Settings },
  { to: '/seller/tariffs', label: 'Мой тариф', icon: CreditCard },
] as const;

export function SellerLayout() {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <NavLink to="/seller/dashboard" className={styles.brand}>
          <span className={styles.brandIcon} aria-hidden>
            <Store size={22} strokeWidth={2.25} />
          </span>
          <span className={styles.brandText}>
            GoShopix <span className={styles.brandAccent}>Seller</span>
          </span>
        </NavLink>
        <nav className={styles.nav}>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              <span className={styles.navIcon} aria-hidden>
                <Icon size={20} strokeWidth={2} />
              </span>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.footer}>
          {user?.email && <p className={styles.footerEmail}>{user.email}</p>}
          <div className={styles.footerActions}>
            <Link to="/" className={styles.footerBtn}>
              <ExternalLink size={18} strokeWidth={2} aria-hidden />
              На витрину
            </Link>
            <button type="button" className={styles.footerBtn} onClick={logout}>
              <LogOut size={18} strokeWidth={2} aria-hidden />
              Выйти
            </button>
          </div>
        </div>
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
