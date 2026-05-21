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
}

export function Tabs({ tabs, active, onChange, children, actions }: TabsProps) {
  return (
    <div className={styles.tabs}>
      <div className={cn(styles.header, actions ? styles.headerWithActions : undefined)}>
        <div className={styles.list} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            className={cn(styles.tab, active === tab.id && styles.active)}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
        </div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
      <div className={styles.panel} role="tabpanel">
        {children}
      </div>
    </div>
  );
}
