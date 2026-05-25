import { resolveProductDeliveryDays } from '@goshopix/shared';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ProductListItem } from '../../api/types';
import { DeliveryBadge } from '../DeliveryBadge/DeliveryBadge';
import { ProductGridCartButton } from '../ProductGridCartButton/ProductGridCartButton';
import { ProductPrice } from '../ProductPrice/ProductPrice';
import { StarRating } from '../../design-system';
import { IconHeart } from '../../design-system/icons/Icons';
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
  const deliveryDays = resolveProductDeliveryDays(
    product.deliveryDaysMin,
    product.deliveryDaysMax,
  );
  const brand = product.brand?.trim();
  const [fav, setFav] = useState(false);
  const [removingFavorite, setRemovingFavorite] = useState(false);
  const hue = placeholderHue(product.id);
  const isFavoriteListed = Boolean(onRemoveFavorite);
  const favActive = isFavoriteListed || fav;

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
        {brand && <span className={styles.brand}>{brand}</span>}
        <Link to={productUrl} className={styles.title}>
          {product.name}
        </Link>

        {(product.rating > 0 || product.reviewCount > 0) && (
          <div className={styles.rating}>
            <StarRating value={product.rating} size="sm" />
            {product.reviewCount > 0 && (
              <span className={styles.reviews}>{product.reviewCount}</span>
            )}
          </div>
        )}

        <ProductPrice
          className={styles.priceRow}
          price={product.price}
          compareAtPrice={product.compareAtPrice}
          size="sm"
        />
        <DeliveryBadge deliveryDays={deliveryDays} />
      </div>
    </article>
  );
}
