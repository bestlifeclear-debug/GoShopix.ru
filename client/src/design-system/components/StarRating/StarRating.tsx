import styles from './StarRating.module.css';

export interface StarRatingProps {
  value: number;
  reviewCount?: number;
  size?: 'sm' | 'md';
  showValue?: boolean;
}

function Stars({ value }: { value: number }) {
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.25 && value - full < 0.85;
  const stars = [];

  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(
        <span key={i} className={styles.starFull} aria-hidden>
          ★
        </span>,
      );
    } else if (i === full && hasHalf) {
      stars.push(
        <span key={i} className={styles.starHalf} aria-hidden>
          ★
        </span>,
      );
    } else {
      stars.push(
        <span key={i} className={styles.starEmpty} aria-hidden>
          ★
        </span>,
      );
    }
  }

  return <span className={styles.stars}>{stars}</span>;
}

export function StarRating({ value, reviewCount, size = 'md', showValue = true }: StarRatingProps) {
  const clamped = Math.min(5, Math.max(0, value));

  return (
    <div
      className={`${styles.wrap} ${styles[size]}`}
      aria-label={`Рейтинг ${clamped.toFixed(1)} из 5`}
    >
      <Stars value={clamped} />
      {showValue && <span className={styles.value}>{clamped.toFixed(1)}</span>}
      {reviewCount !== undefined && (
        <span className={styles.reviews}>
          {reviewCount} {reviewLabel(reviewCount)}
        </span>
      )}
    </div>
  );
}

function reviewLabel(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return 'отзывов';
  if (mod10 === 1) return 'отзыв';
  if (mod10 >= 2 && mod10 <= 4) return 'отзыва';
  return 'отзывов';
}
