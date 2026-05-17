import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import styles from './StatusBadge.module.css';

export type StatusVariant = 'success' | 'warning' | 'error' | 'neutral';

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: StatusVariant;
  dot?: boolean;
  label: string;
}

export function StatusBadge({
  variant = 'neutral',
  dot = true,
  label,
  className,
  ...props
}: StatusBadgeProps) {
  return (
    <span className={cn(styles.badge, styles[variant], className)} {...props}>
      {dot && <span className={styles.dot} aria-hidden />}
      {label}
    </span>
  );
}
