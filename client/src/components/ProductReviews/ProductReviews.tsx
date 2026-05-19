import { useMemo, useState } from 'react';
import { Star, ThumbsUp } from 'lucide-react';
import { Button, StarRating } from '../../design-system';
import { buildDistribution, getInitialReviews } from './mockReviews';
import { draftToReview, ReviewWriteModal, type ReviewDraft } from './ReviewWriteModal';
import type { ProductReview } from './types';
import styles from './ProductReviews.module.css';

interface ProductReviewsProps {
  averageRating: number;
  reviewCount: number;
}

function ReviewStars({ value }: { value: number }) {
  return (
    <div className={styles.reviewStars} aria-label={`Оценка ${value} из 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={16}
          strokeWidth={1.75}
          className={n <= value ? styles.reviewStarOn : styles.reviewStarOff}
          fill={n <= value ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  );
}

function ReviewItem({
  review,
  helpfulVoted,
  onHelpful,
}: {
  review: ProductReview;
  helpfulVoted: boolean;
  onHelpful: () => void;
}) {
  return (
    <li className={styles.reviewCard}>
      <div className={styles.reviewHeader}>
        <p className={styles.reviewAuthor}>{review.authorName}</p>
        <time className={styles.reviewDate} dateTime={review.date}>
          {review.date}
        </time>
      </div>
      <ReviewStars value={review.rating} />
      {review.pros && (
        <p className={styles.reviewBlock}>
          <span className={styles.reviewBlockLabel}>Достоинства</span>
          {review.pros}
        </p>
      )}
      {review.cons && (
        <p className={styles.reviewBlock}>
          <span className={styles.reviewBlockLabel}>Недостатки</span>
          {review.cons}
        </p>
      )}
      <p className={styles.reviewBlock}>
        <span className={styles.reviewBlockLabel}>Комментарий</span>
        {review.comment}
      </p>
      {review.photos.length > 0 && (
        <ul className={styles.reviewPhotos}>
          {review.photos.map((src, i) => (
            <li key={`${review.id}-photo-${i}`}>
              <img src={src} alt="" className={styles.reviewPhoto} loading="lazy" />
            </li>
          ))}
        </ul>
      )}
      <div className={styles.helpfulRow}>
        <span className={styles.helpfulLabel}>Полезно?</span>
        <button
          type="button"
          className={`${styles.helpfulBtn} ${helpfulVoted ? styles.helpfulBtnActive : ''}`}
          onClick={onHelpful}
          aria-pressed={helpfulVoted}
        >
          <ThumbsUp size={16} strokeWidth={2} aria-hidden />
          {review.helpfulCount}
        </button>
      </div>
    </li>
  );
}

export function ProductReviews({ averageRating, reviewCount }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ProductReview[]>(() => getInitialReviews());
  const [totalCount, setTotalCount] = useState(reviewCount);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({});
  const [helpfulCounts, setHelpfulCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(getInitialReviews().map((r) => [r.id, r.helpfulCount])),
  );
  const [modalOpen, setModalOpen] = useState(false);

  const distribution = useMemo(
    () => buildDistribution(reviews, totalCount, averageRating),
    [reviews, totalCount, averageRating],
  );

  const handleHelpful = (reviewId: string) => {
    if (helpfulVotes[reviewId]) return;
    setHelpfulVotes((prev) => ({ ...prev, [reviewId]: true }));
    setHelpfulCounts((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] ?? 0) + 1,
    }));
  };

  const handleSubmitReview = (draft: ReviewDraft) => {
    const id = `user-${Date.now()}`;
    const review = draftToReview(draft, id);
    setReviews((prev) => [review, ...prev]);
    setTotalCount((c) => c + 1);
    setHelpfulCounts((prev) => ({ ...prev, [id]: 0 }));
  };

  return (
    <section className={styles.section} aria-label="Отзывы покупателей">
      <div className={styles.summary}>
        <div className={styles.summaryScore}>
          <span className={styles.scoreBig}>{averageRating.toFixed(1)}</span>
          <StarRating value={averageRating} reviewCount={totalCount} />
        </div>

        <div className={styles.distribution}>
          {distribution.map((row) => (
            <div key={row.stars} className={styles.distRow}>
              <span className={styles.distLabel}>{row.stars} звёзд</span>
              <div className={styles.distTrack}>
                <div className={styles.distFill} style={{ width: `${row.percent}%` }} />
              </div>
              <span className={styles.distPercent}>{row.percent}%</span>
            </div>
          ))}
        </div>

        <div className={styles.writeBtnWrap}>
          <Button type="button" onClick={() => setModalOpen(true)}>
            Написать отзыв
          </Button>
        </div>
      </div>

      <ul className={styles.reviewList}>
        {reviews.map((review) => (
          <ReviewItem
            key={review.id}
            review={{
              ...review,
              helpfulCount: helpfulCounts[review.id] ?? review.helpfulCount,
            }}
            helpfulVoted={!!helpfulVotes[review.id]}
            onHelpful={() => handleHelpful(review.id)}
          />
        ))}
      </ul>

      <ReviewWriteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitReview}
      />
    </section>
  );
}
