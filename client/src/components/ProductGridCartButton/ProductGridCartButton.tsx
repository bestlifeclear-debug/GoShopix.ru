import { useState } from 'react';
import { IconCart } from '../../design-system/icons/Icons';
import styles from './ProductGridCartButton.module.css';

type CartUiState = 'idle' | 'loading' | 'success';

export interface ProductGridCartButtonProps {
  onAdd?: () => void | Promise<void>;
  className?: string;
}

export function ProductGridCartButton({ onAdd, className = '' }: ProductGridCartButtonProps) {
  const [cartState, setCartState] = useState<CartUiState>('idle');

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onAdd || cartState === 'loading') return;
    setCartState('loading');
    try {
      await onAdd();
      setCartState('success');
      window.setTimeout(() => setCartState('idle'), 1800);
    } catch {
      setCartState('idle');
    }
  };

  const label =
    cartState === 'loading' ? 'Добавляем в корзину' : cartState === 'success' ? 'В корзине' : 'В корзину';

  const btnClass = [
    styles.btn,
    cartState === 'success' ? styles.btnSuccess : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={btnClass}
      aria-label={label}
      disabled={cartState === 'loading'}
      onClick={handleClick}
    >
      <IconCart />
    </button>
  );
}
