import { favoritesApi } from '../../api/index';
import type { FavoriteItem, ProductListItem } from '../../api/types';
import { ProductGrid } from '../../components/ProductGrid';
import { EmptyFavoritesState } from './EmptyFavoritesState';
import { FavoriteProductCard } from './FavoriteProductCard';
import styles from './AccountFavorites.module.css';

interface AccountFavoritesProps {
  favorites: FavoriteItem[];
  recommendations: ProductListItem[];
  recommendationsLoading?: boolean;
  onAddToCart: (product: ProductListItem) => void | Promise<void>;
  onFavoritesChange: (next: FavoriteItem[]) => void;
}

export function AccountFavorites({
  favorites,
  recommendations,
  recommendationsLoading = false,
  onAddToCart,
  onFavoritesChange,
}: AccountFavoritesProps) {
  const handleRemoveFavorite = async (productId: string) => {
    await favoritesApi.remove(productId);
    onFavoritesChange(favorites.filter((f) => f.productId !== productId));
  };

  const recommendBlock = (
    <section className={styles.recommend} aria-labelledby="favorites-reco-title">
      <h2 id="favorites-reco-title" className={styles.recommendTitle}>
        Популярное сейчас
      </h2>
      <p className={styles.recommendLead}>Топ выбора покупателей — добавьте в корзину в один клик</p>
      <div className={styles.recommendGrid}>
        <ProductGrid
          products={recommendations}
          loading={recommendationsLoading}
          skeletonCount={4}
          minSlots={4}
          variant="compact"
          hideFavorite
          onAddToCart={onAddToCart}
        />
      </div>
    </section>
  );

  if (favorites.length === 0) {
    return (
      <div className={styles.root}>
        <h1 className={styles.pageTitle}>Избранное</h1>
        <div className={styles.emptyWrap}>
          <EmptyFavoritesState />
        </div>
        {recommendBlock}
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <h1 className={styles.pageTitle}>Избранное</h1>
      <ul className={styles.grid} aria-label="Избранные товары">
        {favorites.map((item) => (
          <li key={item.id}>
            <FavoriteProductCard
              product={item.product}
              onRemoveFavorite={() => handleRemoveFavorite(item.productId)}
              onAddToCart={() => onAddToCart(item.product)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
