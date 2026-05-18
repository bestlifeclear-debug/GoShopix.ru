import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { CartDrawer } from '../CartDrawer/CartDrawer';
import { useCartStore } from '../../stores/cartStore';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';
import styles from './MainLayout.module.css';

export function MainLayout() {
  const initGuestCart = useCartStore((s) => s.initGuestCart);

  useEffect(() => {
    initGuestCart();
  }, [initGuestCart]);

  return (
    <div className={styles.layout}>
      <SiteHeader />
      <main className={styles.main}>
        <Outlet />
      </main>
      <SiteFooter />
      <CartDrawer />
    </div>
  );
}
