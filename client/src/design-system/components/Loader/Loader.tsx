import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { Spinner, type SpinnerSize } from '../Spinner/Spinner';
import styles from './Loader.module.css';

export type LoaderVariant = 'inline' | 'block' | 'page' | 'overlay';

export interface LoaderProps {
  variant?: LoaderVariant;
  label?: string;
  showBrand?: boolean;
  spinnerSize?: SpinnerSize;
  className?: string;
  children?: ReactNode;
}

export function Loader({
  variant = 'block',
  label = 'Загрузка…',
  showBrand = false,
  spinnerSize,
  className,
  children,
}: LoaderProps) {
  const size = spinnerSize ?? (variant === 'inline' ? 'sm' : variant === 'overlay' ? 'lg' : 'md');
  const showMark = showBrand || variant === 'page' || variant === 'overlay';

  const content = (
    <>
      {showMark && (
        <span className={styles.brandMark} aria-hidden>
          G
        </span>
      )}
      <Spinner size={size} label={label} />
      {label ? <p className={styles.label}>{label}</p> : null}
      {children}
    </>
  );

  if (variant === 'overlay') {
    return (
      <div className={cn(styles.overlay, className)} role="status" aria-live="polite" aria-busy="true">
        <div className={styles.overlayCard}>{content}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(styles[variant], className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      {content}
    </div>
  );
}
