import type { ReactNode } from 'react';
import { cn } from '../design-system/utils/cn';
import styles from './Tabs.module.css';

export interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
  children: ReactNode;
  /** Дополнительные элементы справа от табов (например, кнопка действия) */
  actions?: ReactNode;
  className?: string;
  variant?: 'default' | 'pdp';
}

export function Tabs({
  tabs,
  active,
  onChange,
  children,
  actions,
  className,
  variant = 'default',
}: TabsProps) {
  const isPdp = variant === 'pdp';

  return (
    <div className={cn(styles.tabs, isPdp && styles.tabsPdp, className)}>
      <div
        className={cn(
          styles.header,
          isPdp && styles.headerPdp,
          actions ? styles.headerWithActions : undefined,
        )}
      >
        <div className={cn(styles.list, isPdp && styles.listPdp)} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            className={cn(
              styles.tab,
              isPdp && styles.tabPdp,
              active === tab.id && styles.active,
              active === tab.id && isPdp && styles.activePdp,
            )}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
        </div>
        {actions ? <div className={cn(styles.actions, isPdp && styles.actionsPdp)}>{actions}</div> : null}
      </div>
      <div className={cn(styles.panel, isPdp && styles.panelPdp)} role="tabpanel">
        {children}
      </div>
    </div>
  );
}
