import { formatPrice } from '@goshopix/shared';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ProductListItem } from '../../api/types';
import { hasProductDiscount } from '../../lib/productDiscount';
import { ProductGridCartButton } from '../ProductGridCartButton/ProductGridCartButton';
import { StarRating } from '../../design-system';
import { IconHeart, IconMessage } from '../../design-system/icons/Icons';
import styles from './MobileProductCard.module.css';

interface MobileProductCardProps {
  product: ProductListItem;
  onAddToCart?: () => void | Promise<void>;
  /** В корзине / рекомендациях — без кнопки избранного */
  showFavorite?: boolean;
  /** Избранное: активное сердце и удаление (вместо локального toggle) */
  onRemoveFavorite?: () => void | Promise<void>;
}

function placeholderHue(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i)) % 360;
  return h;
}

export function MobileProductCard({
  product,
  onAddToCart,
  showFavorite = true,
  onRemoveFavorite,
}: MobileProductCardProps) {
  const image = product.images?.[0]?.url ?? product.imageUrl ?? undefined;
  const productUrl = `/product/${product.id}`;
  const [fav, setFav] = useState(false);
  const [removingFavorite, setRemovingFavorite] = useState(false);
  const hue = placeholderHue(product.id);
  const isFavoriteListed = Boolean(onRemoveFavorite);
  const favActive = isFavoriteListed || fav;
  const onSale = hasProductDiscount(product.price, product.compareAtPrice);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemoveFavorite) {
      if (removingFavorite) return;
      setRemovingFavorite(true);
      try {
        await onRemoveFavorite();
      } finally {
        setRemovingFavorite(false);
      }
      return;
    }
    setFav((v) => !v);
  };

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <Link to={productUrl} className={styles.mediaLink} aria-label={product.name}>
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
            className={`${styles.favBtn} ${favActive ? styles.favBtnActive : ''}`}
            aria-label={favActive ? 'Убрать из избранного' : 'В избранное'}
            disabled={removingFavorite}
            onClick={handleFavoriteClick}
          >
            <IconHeart />
          </button>
        ) : null}
        <ProductGridCartButton onAdd={onAddToCart} />
      </div>

      <div className={styles.body}>
        <div className={styles.priceBlock}>
          <span className={styles.price}>{formatPrice(product.price)}</span>
          {onSale && product.compareAtPrice != null && (
            <span className={styles.oldPrice}>{formatPrice(product.compareAtPrice)}</span>
          )}
          {product.discountPercent != null && product.discountPercent > 0 && (
            <span className={styles.discount}>−{product.discountPercent}%</span>
          )}
        </div>

        <Link to={productUrl} className={styles.title}>
          {product.name}
        </Link>

        {(product.rating > 0 || product.reviewCount > 0) && (
          <div className={styles.rating}>
            {product.rating > 0 && (
              <>
                <StarRating value={product.rating} size="sm" />
                <span className={styles.ratingValue}>{product.rating.toFixed(1)}</span>
              </>
            )}
            {product.reviewCount > 0 && (
              <span className={styles.reviews}>
                <IconMessage className={styles.reviewsIcon} strokeWidth={1.5} />
                {product.reviewCount}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
