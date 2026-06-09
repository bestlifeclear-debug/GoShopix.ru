import { Star } from 'lucide-react';
import { getInitialReviews } from './mockReviews';
import type { ProductReview } from './types';
import styles from './ProductReviewPreview.module.css';

function pickPreviewReviews(reviews: ProductReview[], limit = 2): ProductReview[] {
  const withPhotos = reviews.filter((r) => r.photos.length > 0);
  const pool = withPhotos.length >= 1 ? withPhotos : reviews;
  return pool.slice(0, limit);
}

function ReviewStars({ value }: { value: number }) {
  return (
    <div className={styles.stars} aria-label={`Оценка ${value} из 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={14}
          strokeWidth={1.75}
          className={n <= value ? styles.starOn : styles.starOff}
          fill={n <= value ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  );
}

interface ProductReviewPreviewProps {
  reviewCount: number;
  onViewAll: () => void;
  compact?: boolean;
}

export function ProductReviewPreview({
  reviewCount,
  onViewAll,
  compact = false,
}: ProductReviewPreviewProps) {
  if (reviewCount <= 0) return null;

  const previews = pickPreviewReviews(getInitialReviews(), 2);
  if (previews.length === 0) return null;

  return (
    <section
      id="pdp-reviews-preview"
      className={`${styles.section} ${compact ? styles.sectionCompact : ''}`}
      aria-label="Отзывы покупателей"
    >
      {!compact && <h2 className={styles.title}>Отзывы покупателей</h2>}
      <ul className={styles.list}>
        {previews.map((review) => (
          <li key={review.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.author}>{review.authorName}</span>
              <time className={styles.date} dateTime={review.createdAt}>
                {review.date}
              </time>
            </div>
            <ReviewStars value={review.rating} />
            <p className={styles.comment}>{review.comment}</p>
            {review.photos.length > 0 && (
              <ul className={styles.photos}>
                {review.photos.slice(0, 3).map((src, i) => (
                  <li key={`${review.id}-photo-${i}`}>
                    <img src={src} alt="" className={styles.photo} loading="lazy" />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      <button type="button" className={styles.viewAll} onClick={onViewAll}>
        Смотреть все {reviewCount} отзывов
      </button>
    </section>
  );
}
