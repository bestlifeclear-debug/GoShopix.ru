import { formatDeliveryLabel, formatPrice } from '@goshopix/shared';
import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconChevronLeft, IconChevronRight, IconHeart } from '../../icons/Icons';
import { Button } from '../Button/Button';
import { StarRating } from '../StarRating/StarRating';
import styles from './ProductCard.module.css';

export interface ProductCardImage {
  url: string;
  alt?: string | null;
}

export interface ProductCardProps {
  productId: string;
  title: string;
  brand?: string | null;
  price: number;
  compareAtPrice?: number | null;
  discountPercent?: number | null;
  rating: number;
  reviewCount: number;
  promoBadge?: string | null;
  deliveryDaysMin?: number | null;
  deliveryDaysMax?: number | null;
  images: ProductCardImage[];
  highlightPrice?: boolean;
  isHit?: boolean;
  onAddToCart?: (e: React.MouseEvent) => void | Promise<void>;
  onFavorite?: (e: React.MouseEvent) => void;
}

type CartUiState = 'idle' | 'loading' | 'success';

export function ProductCard({
  productId,
  title,
  brand,
  price,
  compareAtPrice,
  discountPercent,
  rating,
  reviewCount,
  promoBadge,
  deliveryDaysMin,
  deliveryDaysMax,
  images,
  highlightPrice = false,
  isHit,
  onAddToCart,
  onFavorite,
}: ProductCardProps) {
  const slides = images.length > 0 ? images : [{ url: '', alt: title }];
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [fav, setFav] = useState(false);
  const [cartState, setCartState] = useState<CartUiState>('idle');

  const deliveryLabel = formatDeliveryLabel(deliveryDaysMin, deliveryDaysMax);

  const go = useCallback(
    (dir: -1 | 1) => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIndex((i) => (i + dir + slides.length) % slides.length);
    },
    [slides.length],
  );

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onAddToCart || cartState === 'loading') return;
    setCartState('loading');
    try {
      await onAddToCart(e);
      setCartState('success');
      window.setTimeout(() => setCartState('idle'), 1800);
    } catch {
      setCartState('idle');
    }
  };

  const current = slides[index] ?? slides[0];
  const showHit = isHit ?? reviewCount >= 50;

  const cartLabel =
    cartState === 'loading' ? 'Добавляем…' : cartState === 'success' ? 'В корзине ✓' : 'В корзину';

  return (
    <article
      className={styles.card}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setIndex(0);
      }}
    >
      <div className={styles.media}>
        <Link to={`/product/${productId}`} className={styles.mediaLink} aria-label={title}>
          {current.url ? (
            <img
              src={current.url}
              alt={current.alt ?? title}
              className={styles.image}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className={styles.placeholder} aria-hidden>
              <span>GoShopix</span>
            </div>
          )}
        </Link>

        <button
          type="button"
          className={`${styles.favBtn} ${fav ? styles.favBtnActive : ''} ${hovered ? styles.favBtnVisible : ''}`}
          aria-label={fav ? 'Убрать из избранного' : 'В избранное'}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setFav((v) => !v);
            onFavorite?.(e);
          }}
        >
          <IconHeart />
        </button>

        {discountPercent != null && discountPercent > 0 && (
          <span className={styles.discountBadge}>−{discountPercent}%</span>
        )}

        {showHit && <span className={styles.hitBadge}>Хит</span>}

        {promoBadge && <span className={styles.promoBadge}>{promoBadge}</span>}

        {slides.length > 1 && hovered && (
          <>
            <button type="button" className={`${styles.navBtn} ${styles.navPrev}`} onClick={go(-1)} aria-label="Назад">
              <IconChevronLeft />
            </button>
            <button type="button" className={`${styles.navBtn} ${styles.navNext}`} onClick={go(1)} aria-label="Вперёд">
              <IconChevronRight />
            </button>
          </>
        )}
      </div>

      <div className={styles.body}>
        {brand && <p className={styles.brand}>{brand}</p>}
        <Link to={`/product/${productId}`} className={styles.title}>
          {title}
        </Link>

        <StarRating value={rating} reviewCount={reviewCount} size="sm" />

        <div className={`${styles.prices} ${highlightPrice ? styles.pricesHighlight : ''}`}>
          <span className={styles.price}>{formatPrice(price)}</span>
          {compareAtPrice != null && compareAtPrice > price && (
            <span className={styles.oldPrice}>{formatPrice(compareAtPrice)}</span>
          )}
        </div>

        {deliveryLabel && <p className={styles.delivery}>{deliveryLabel}</p>}

        <Button
          variant="outline"
          size="sm"
          loading={cartState === 'loading'}
          className={`${styles.cartBtn} ${cartState === 'success' ? styles.cartBtnSuccess : ''}`}
          onClick={handleAddToCart}
          aria-live="polite"
        >
          {cartLabel}
        </Button>
      </div>
    </article>
  );
}
