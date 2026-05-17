import { cn } from '../../utils/cn';
import styles from './Skeleton.module.css';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, variant = 'rect', width, height }: SkeletonProps) {
  return (
    <span
      className={cn(styles.skeleton, styles[variant], className)}
      style={{ width, height }}
      aria-hidden
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className={styles.card}>
      <Skeleton className={styles.cardImage} />
      <div className={styles.cardBody}>
        <Skeleton variant="text" height={14} width="40%" />
        <Skeleton variant="text" height={18} width="90%" />
        <Skeleton variant="text" height={14} width="60%" />
        <Skeleton variant="text" height={24} width="50%" />
        <Skeleton height={48} className={styles.cardBtn} />
      </div>
    </div>
  );
}
