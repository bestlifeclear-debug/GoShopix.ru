import type { ReactNode } from 'react';
import styles from './PageContainer.module.css';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

/** Единая сетка контента 1400px — как на Ozon / Wildberries */
export function PageContainer({ children, className = '' }: PageContainerProps) {
  return <div className={`container ${styles.root} ${className}`.trim()}>{children}</div>;
}
