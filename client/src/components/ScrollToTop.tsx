import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { NavigationProgress } from './NavigationProgress/NavigationProgress';
import styles from './PageTransition/PageTransition.module.css';

/** Сбрасывает прокрутку и показывает прогресс при переходе между страницами. */
export function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, search, hash]);

  const routeKey = `${pathname}${search}`;

  return (
    <>
      <NavigationProgress />
      <div key={routeKey} className={styles.wrap}>
        <Outlet />
      </div>
    </>
  );
}
