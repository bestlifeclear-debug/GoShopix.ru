import { formatPrice } from '@goshopix/shared';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ProductListItem } from '../../api/types';
import { IconCart, IconHeart } from '../../design-system/icons/Icons';
import styles from './FavoriteProductCard.module.css';

interface FavoriteProductCardProps {
  product: ProductListItem;
  onRemoveFavorite: () => void | Promise<void>;
  onAddToCart?: () => void | Promise<void>;
}

type CartUiState = 'idle' | 'loading' | 'success';

function placeholderHue(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i)) % 360;
  return h;
}

export function FavoriteProductCard({
  product,
  onRemoveFavorite,
  onAddToCart,
}: FavoriteProductCardProps) {
  const image = product.images?.[0]?.url ?? product.imageUrl ?? undefined;
  const hasDiscount = product.compareAtPrice != null && product.compareAtPrice > product.price;
  const highlightPrice = Boolean(product.discountPercent && product.discountPercent > 0);
  const productUrl = `/product/${product.id}`;
  const [removing, setRemoving] = useState(false);
  const [cartState, setCartState] = useState<CartUiState>('idle');
  const hue = placeholderHue(product.id);

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (removing) return;
    setRemoving(true);
    try {
      await onRemoveFavorite();
    } finally {
      setRemoving(false);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onAddToCart || cartState === 'loading') return;
    setCartState('loading');
    try {
      await onAddToCart();
      setCartState('success');
      window.setTimeout(() => setCartState('idle'), 1800);
    } catch {
      setCartState('idle');
    }
  };

  const cartLabel =
    cartState === 'loading' ? 'Добавляем в корзину' : cartState === 'success' ? 'В корзине' : 'В корзину';

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <Link to={productUrl} className={styles.mediaLink} aria-label={product.name}>
          {product.discountPercent != null && product.discountPercent > 0 && (
            <span className={styles.badge}>−{product.discountPercent}%</span>
          )}
          {image ? (
            <img src={image} alt="" className={styles.image} loading="lazy" decoding="async" />
          ) : (
            <div
              className={styles.placeholder}
              style={{
                background: `linear-gradient(145deg, hsl(${hue} 62% 48%) 0%, hsl(${(hue + 36) % 360} 55% 62%) 100%)`,
              }}
              aria-hidden
            >
              <span className={styles.placeholderText}>{product.name}</span>
            </div>
          )}
        </Link>
        <button
          type="button"
          className={styles.favBtn}
          aria-label="Убрать из избранного"
          disabled={removing}
          onClick={handleRemove}
        >
          <IconHeart />
        </button>
        <button
          type="button"
          className={`${styles.cartBtn} ${cartState === 'success' ? styles.cartBtnSuccess : ''}`}
          aria-label={cartLabel}
          disabled={cartState === 'loading'}
          onClick={handleAddToCart}
        >
          <IconCart />
        </button>
      </div>

      <div className={styles.body}>
        <div className={`${styles.prices} ${highlightPrice ? styles.pricesSale : ''}`}>
          <span className={styles.price}>{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className={styles.oldPrice}>{formatPrice(product.compareAtPrice!)}</span>
          )}
        </div>
        <Link to={productUrl} className={styles.title}>
          {product.name}
        </Link>
      </div>
    </article>
  );
}
