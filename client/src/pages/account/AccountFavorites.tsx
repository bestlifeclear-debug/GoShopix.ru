import { useNavigate } from 'react-router-dom';
import type { FavoriteItem } from '../../api/types';
import { ProductGrid } from '../../components/ProductGrid';
import styles from '../AccountPage.module.css';

interface AccountFavoritesProps {
  favorites: FavoriteItem[];
}

export function AccountFavorites({ favorites }: AccountFavoritesProps) {
  const navigate = useNavigate();

  if (favorites.length === 0) {
    return (
      <p className={styles.emptyState}>
        В избранном пока пусто.{' '}
        <button type="button" className={styles.widgetLink} onClick={() => navigate('/catalog')}>
          Перейти в каталог
        </button>
      </p>
    );
  }

  return <ProductGrid products={favorites.map((f) => f.product)} onAddToCart={() => navigate('/catalog')} />;
}
