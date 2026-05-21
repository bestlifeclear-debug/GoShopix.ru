import { cn } from '../../utils/cn';
import styles from './Spinner.module.css';

export type SpinnerSize = 'sm' | 'md' | 'lg';
export type SpinnerTone = 'brand' | 'neutral' | 'inverse' | 'inherit';

export interface SpinnerProps {
  size?: SpinnerSize;
  tone?: SpinnerTone;
  className?: string;
  label?: string;
}

export function Spinner({ size = 'md', tone = 'brand', className, label = 'Загрузка' }: SpinnerProps) {
  return (
    <span
      className={cn(styles.spinner, styles[size], styles[tone], className)}
      role="status"
      aria-label={label}
      aria-live="polite"
    />
  );
}
