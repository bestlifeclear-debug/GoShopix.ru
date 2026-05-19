import type { ReactNode } from 'react';
import styles from './AccountLayout.module.css';

export interface AccountLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
  themeClass: 'theme-light' | 'theme-dark';
}

/**
 * Сетка ЛК (сайдбар + контент) под общей шапкой из MainLayout.
 * Шапка не входит в grid — как на Ozon / Wildberries.
 */
export function AccountLayout({ sidebar, children, themeClass }: AccountLayoutProps) {
  return (
    <div className={`container ${styles.shell} ${themeClass}`} data-account-lk>
      {sidebar}
      <main className={styles.main}>{children}</main>
    </div>
  );
}
