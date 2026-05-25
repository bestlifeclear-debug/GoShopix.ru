import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  IconCart,
  IconCatalog,
  IconHeart,
  IconHome,
  IconUser,
} from '../../design-system/icons/Icons';
import { useAuthStore } from '../../stores/authStore';
import { selectCartItemCount, useCartStore } from '../../stores/cartStore';
import styles from './MobileBottomNav.module.css';

type NavKey = 'home' | 'catalog' | 'cart' | 'favorites' | 'profile';

function isActive(pathname: string, search: string, key: NavKey): boolean {
  switch (key) {
    case 'home':
      return pathname === '/';
    case 'catalog':
      return (
        pathname === '/categories' ||
        pathname === '/catalog' ||
        pathname.startsWith('/product/')
      );
    case 'cart':
      return pathname === '/cart' || pathname.startsWith('/checkout');
    case 'favorites': {
      const params = new URLSearchParams(search);
      return pathname === '/account' && params.get('section') === 'favorites';
    }
    case 'profile':
      return (
        pathname === '/auth' ||
        (pathname === '/account' && new URLSearchParams(search).get('section') !== 'favorites')
      );
    default:
      return false;
  }
}

export function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useAuthStore((s) => s.token);
  const cartCount = useCartStore((s) => selectCartItemCount(s, Boolean(token)));
  const favoritesTo = token ? '/account?section=favorites' : '/auth?returnUrl=/account%3Fsection%3Dfavorites';
  const profileTo = token ? '/account?section=dashboard' : '/auth';

  const handleCartClick = () => {
    navigate('/cart');
  };

  const items: {
    key: NavKey;
    label: string;
    to?: string;
    onClick?: () => void;
    icon: ReactNode;
    badge?: number;
  }[] = [
    { key: 'home', label: 'Главная', to: '/', icon: <IconHome className={styles.icon} /> },
    {
      key: 'catalog',
      label: 'Каталог',
      to: '/categories',
      icon: <IconCatalog className={styles.icon} />,
    },
    {
      key: 'cart',
      label: 'Корзина',
      onClick: handleCartClick,
      icon: <IconCart className={styles.icon} />,
      badge: cartCount,
    },
    {
      key: 'favorites',
      label: 'Избранное',
      to: favoritesTo,
      icon: <IconHeart className={styles.icon} strokeWidth={1.75} />,
    },
    {
      key: 'profile',
      label: 'Профиль',
      to: profileTo,
      icon: <IconUser className={styles.icon} strokeWidth={1.75} />,
    },
  ];

  return (
    <nav className={styles.bar} aria-label="Основная навигация">
      <svg width="0" height="0" aria-hidden className={styles.gradientDefs}>
        <defs>
          <linearGradient id="goshopix-nav-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF7062" />
            <stop offset="100%" stopColor="#FF3D2E" />
          </linearGradient>
        </defs>
      </svg>
      {items.map((item) => {
        const active = isActive(location.pathname, location.search, item.key);
        const className = `${styles.item} ${active ? styles.itemActive : ''}`;

        if (item.onClick) {
          return (
            <button
              key={item.key}
              type="button"
              className={className}
              onClick={item.onClick}
              aria-label={item.badge ? `${item.label}, ${item.badge} товаров` : item.label}
              aria-current={active ? 'page' : undefined}
            >
              <span className={styles.iconWrap}>
                {item.icon}
                {item.badge != null && item.badge > 0 && (
                  <span className={styles.badge}>{item.badge > 99 ? '99+' : item.badge}</span>
                )}
              </span>
              <span className={styles.label}>{item.label}</span>
            </button>
          );
        }

        return (
          <Link
            key={item.key}
            to={item.to!}
            className={className}
            aria-current={active ? 'page' : undefined}
          >
            <span className={styles.iconWrap}>
              {item.icon}
              {item.badge != null && item.badge > 0 && (
                <span className={styles.badge}>{item.badge > 99 ? '99+' : item.badge}</span>
              )}
            </span>
            <span className={styles.label}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
