import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { CartDrawer } from '../CartDrawer/CartDrawer';
import { Toast } from '../Toast/Toast';
import pageTransitionStyles from '../PageTransition/PageTransition.module.css';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { MobileBottomNav } from './MobileBottomNav';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';
import styles from './MainLayout.module.css';

export function MainLayout() {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const routeKey = `${pathname}${search}`;
  const isCartRoute = pathname === '/cart';
  const isCategoriesHubRoute = pathname === '/categories';
  const token = useAuthStore((s) => s.token);
  const initGuestCart = useCartStore((s) => s.initGuestCart);
  const openDrawer = useCartStore((s) => s.openDrawer);

  useEffect(() => {
    initGuestCart();
  }, [initGuestCart]);

  useEffect(() => {
    const params = new URLSearchParams(search);
    if (params.get('cart') !== 'open') return;
    if (!token && pathname !== '/cart') {
      openDrawer();
    }
    params.delete('cart');
    const nextSearch = params.toString();
    navigate({ pathname, search: nextSearch ? `?${nextSearch}` : '' }, { replace: true });
  }, [search, pathname, token, openDrawer, navigate]);

  return (
    <div
      className={`${styles.layout} ${isCartRoute ? styles.layoutCart : ''} ${isCategoriesHubRoute ? styles.layoutCategoriesHub : ''}`}
    >
      <SiteHeader />
      <main className={styles.main}>
        <div key={routeKey} className={pageTransitionStyles.wrap}>
          <Outlet />
        </div>
      </main>
      <div className={styles.footerWrap}>
        <SiteFooter />
      </div>
      <MobileBottomNav />
      <CartDrawer />
      <Toast />
    </div>
  );
}
