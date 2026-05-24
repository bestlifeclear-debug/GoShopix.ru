import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { CartDrawer } from '../CartDrawer/CartDrawer';
import { Toast } from '../Toast/Toast';
import pageTransitionStyles from '../PageTransition/PageTransition.module.css';
import { useCartStore } from '../../stores/cartStore';
import { MobileBottomNav } from './MobileBottomNav';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';
import styles from './MainLayout.module.css';

export function MainLayout() {
  const { pathname, search } = useLocation();
  const routeKey = `${pathname}${search}`;
  const isCartRoute = pathname === '/cart';
  const isCategoriesHubRoute = pathname === '/categories';
  const initGuestCart = useCartStore((s) => s.initGuestCart);

  useEffect(() => {
    initGuestCart();
  }, [initGuestCart]);

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
