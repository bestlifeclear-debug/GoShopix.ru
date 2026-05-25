import { formatDeliveryLabel, formatPrice } from '@goshopix/shared';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ProductListItem } from '../../api/types';
import { StarRating } from '../../design-system';
import { IconHeart } from '../../design-system/icons/Icons';
import styles from './MobileProductCard.module.css';

interface MobileProductCardProps {
  product: ProductListItem;
  highlightPrice?: boolean;
  onAddToCart?: () => void | Promise<void>;
  /** В корзине / рекомендациях — без кнопки избранного */
  showFavorite?: boolean;
}

type CartUiState = 'idle' | 'loading' | 'success';

function buildMetaLine(product: ProductListItem): string | null {
  const parts: string[] = [];
  if (product.category?.name) parts.push(product.category.name);
  const delivery = formatDeliveryLabel(product.deliveryDaysMin, product.deliveryDaysMax);
  if (delivery) parts.push(delivery);
  return parts.length > 0 ? parts.join(' · ') : null;
}

function placeholderHue(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i)) % 360;
  return h;
}

export function MobileProductCard({
  product,
  highlightPrice,
  onAddToCart,
  showFavorite = true,
}: MobileProductCardProps) {
  const image = product.images?.[0]?.url ?? product.imageUrl ?? undefined;
  const hasDiscount = product.compareAtPrice != null && product.compareAtPrice > product.price;
  const productUrl = `/product/${product.id}`;
  const meta = buildMetaLine(product);
  const brand = product.brand?.trim();
  const [fav, setFav] = useState(false);
  const [cartState, setCartState] = useState<CartUiState>('idle');

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
    cartState === 'loading' ? 'Добавляем…' : cartState === 'success' ? 'В корзине ✓' : 'В корзину';

  const hue = placeholderHue(product.id);

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
        {showFavorite ? (
          <button
            type="button"
            className={`${styles.favBtn} ${fav ? styles.favBtnActive : ''}`}
            aria-label={fav ? 'Убрать из избранного' : 'В избранное'}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setFav((v) => !v);
            }}
          >
            <IconHeart />
          </button>
        ) : null}
      </div>

      <div className={styles.body}>
        {brand && <span className={styles.brand}>{brand}</span>}
        <Link to={productUrl} className={styles.title}>
          {product.name}
        </Link>

        <div className={`${styles.prices} ${highlightPrice ? styles.pricesSale : ''}`}>
          <span className={styles.price}>{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className={styles.oldPrice}>{formatPrice(product.compareAtPrice!)}</span>
          )}
        </div>

        {(product.rating > 0 || product.reviewCount > 0) && (
          <div className={styles.rating}>
            <StarRating value={product.rating} size="sm" />
            {product.reviewCount > 0 && (
              <span className={styles.reviews}>{product.reviewCount}</span>
            )}
          </div>
        )}

        {meta && <p className={styles.meta}>{meta}</p>}

        <button
          type="button"
          className={`${styles.cartBtn} ${cartState === 'loading' ? styles.cartBtnLoading : ''} ${cartState === 'success' ? styles.cartBtnSuccess : ''}`}
          onClick={handleAddToCart}
          disabled={cartState === 'loading'}
          aria-live="polite"
        >
          {cartLabel}
        </button>
      </div>
    </article>
  );
}
