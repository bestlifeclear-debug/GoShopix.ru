import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import styles from './Input.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  inputSize?: 'sm' | 'md' | 'lg';
}

export function Input({
  label,
  hint,
  error,
  leftSlot,
  rightSlot,
  inputSize = 'md',
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  const hasError = Boolean(error);

  return (
    <div className={cn(styles.field, className)}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className={cn(styles.control, styles[inputSize], hasError && styles.hasError)}>
        {leftSlot && <span className={styles.slot}>{leftSlot}</span>}
        <input id={inputId} className={styles.input} aria-invalid={hasError} {...props} />
        {rightSlot && <span className={styles.slot}>{rightSlot}</span>}
      </div>
      {(hint || error) && (
        <p className={cn(styles.message, hasError && styles.errorMessage)} role={hasError ? 'alert' : undefined}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
