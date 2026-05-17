import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import styles from './SellerLayout.module.css';

const links = [
  { to: '/seller/dashboard', label: 'Дашборд' },
  { to: '/seller/products', label: 'Товары' },
  { to: '/seller/orders', label: 'Заказы' },
  { to: '/seller/analytics', label: 'Аналитика' },
  { to: '/seller/settings', label: 'Настройки' },
];

export function SellerLayout() {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <NavLink to="/seller/dashboard" className={styles.brand}>
          GoShopix Seller
        </NavLink>
        <nav className={styles.nav}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.footer}>
          <p>{user?.email}</p>
          <a href="/">На витрину</a>
          {' · '}
          <button type="button" onClick={logout}>
            Выйти
          </button>
        </div>
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
