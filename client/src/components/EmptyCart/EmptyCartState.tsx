import { Link } from 'react-router-dom';
import { EmptyCartIllustration } from './EmptyCartIllustration';
import styles from './emptyCart.module.css';

type EmptyCartStateProps = {
  onCatalogClick?: () => void;
  hint?: string;
  className?: string;
};

export function EmptyCartState({ onCatalogClick, hint, className = '' }: EmptyCartStateProps) {
  return (
    <div className={`${styles.root} ${className}`.trim()}>
      <EmptyCartIllustration className={styles.illustration} />
      <p className={styles.title}>Корзина пуста</p>
      {hint ? <p className={styles.hint}>{hint}</p> : null}
      <Link to="/catalog" className={styles.catalogBtn} onClick={onCatalogClick}>
        В каталог
      </Link>
    </div>
  );
}
