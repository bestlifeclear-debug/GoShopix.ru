import { Link } from 'react-router-dom';
import { EmptyFavoritesIllustration } from './EmptyFavoritesIllustration';
import styles from './EmptyFavoritesState.module.css';

type EmptyFavoritesStateProps = {
  className?: string;
};

export function EmptyFavoritesState({ className = '' }: EmptyFavoritesStateProps) {
  return (
    <div className={`${styles.root} ${className}`.trim()}>
      <EmptyFavoritesIllustration className={styles.icon} />
      <p className={styles.title}>В избранном пока пусто</p>
      <p className={styles.hint}>Сохраняйте понравившиеся товары сердечком или выберите популярное ниже</p>
      <Link to="/catalog" className={styles.catalogBtn}>
        Перейти в каталог
      </Link>
    </div>
  );
}
