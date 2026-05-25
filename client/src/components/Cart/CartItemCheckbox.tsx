import { Check } from 'lucide-react';
import styles from './CartItemCheckbox.module.css';

interface CartItemCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel: string;
  className?: string;
}

export function CartItemCheckbox({
  checked,
  onChange,
  ariaLabel,
  className = '',
}: CartItemCheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={[styles.btn, className].filter(Boolean).join(' ')}
    >
      <span className={[styles.box, checked ? styles.boxChecked : ''].join(' ')}>
        {checked ? <Check size={11} strokeWidth={3} className="text-white" aria-hidden /> : null}
      </span>
    </button>
  );
}
