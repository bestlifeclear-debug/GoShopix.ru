import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductGridCartButton } from '../../../components/ProductGridCartButton/ProductGridCartButton';
import { ProductPrice } from '../../../components/ProductPrice/ProductPrice';
import { IconChevronLeft, IconChevronRight, IconHeart } from '../../icons/Icons';
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
  /** До 2 строк характеристик на превью (без запроса к API) */
  specLines?: string[];
  images: ProductCardImage[];
  onAddToCart?: () => void | Promise<void>;
  onFavorite?: (e: React.MouseEvent) => void;
}

export function ProductCard({
  productId,
  title,
  brand,
  price,
  compareAtPrice,
  discountPercent,
  rating,
  reviewCount,
  specLines = [],
  images,
  onAddToCart,
  onFavorite,
}: ProductCardProps) {
  const slides = images.length > 0 ? images : [{ url: '', alt: title }];
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [fav, setFav] = useState(false);
  const go = useCallback(
    (dir: -1 | 1) => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIndex((i) => (i + dir + slides.length) % slides.length);
    },
    [slides.length],
  );

  const current = slides[index] ?? slides[0];
  const specs = specLines.filter(Boolean).slice(0, 2);

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

        {onAddToCart ? <ProductGridCartButton onAdd={onAddToCart} /> : null}
      </div>

      <div className={styles.body}>
        <div className={styles.rowTitle}>
          {brand && <span className={styles.brand}>{brand}</span>}
          <Link to={`/product/${productId}`} className={styles.title}>
            {title}
          </Link>
        </div>

        <ProductPrice price={price} compareAtPrice={compareAtPrice} size="md" />

        <div className={styles.rowRating}>
          <StarRating value={rating} reviewCount={reviewCount} size="sm" />
        </div>

        {specs.length > 0 && (
          <ul className={styles.specs} aria-label="Краткие характеристики">
            {specs.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}

      </div>
    </article>
  );
}
