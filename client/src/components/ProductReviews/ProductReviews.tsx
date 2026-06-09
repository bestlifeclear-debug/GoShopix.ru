import { useMemo, useState } from 'react';
import { Star, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Button, StarRating } from '../../design-system';
import { buildDistribution, getInitialReviews } from './mockReviews';
import { filterAndSortReviews, REVIEW_SORT_OPTIONS } from './reviewFilters';
import { draftToReview, ReviewWriteModal, type ReviewDraft } from './ReviewWriteModal';
import type { ProductReview, ReviewSort } from './types';
import styles from './ProductReviews.module.css';

type ReviewVote = 'up' | 'down';

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
  vote,
  onVote,
}: {
  review: ProductReview;
  vote: ReviewVote | null;
  onVote: (kind: ReviewVote) => void;
}) {
  return (
    <li className={styles.reviewCard}>
      <div className={styles.reviewHeader}>
        <p className={styles.reviewAuthor}>{review.authorName}</p>
        <time className={styles.reviewDate} dateTime={review.createdAt}>
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
        <span className={styles.helpfulLabel}>Полезен отзыв?</span>
        <div className={styles.voteGroup}>
          <button
            type="button"
            className={`${styles.voteBtn} ${vote === 'up' ? styles.voteBtnActive : ''}`}
            onClick={() => onVote('up')}
            aria-pressed={vote === 'up'}
            aria-label={`Полезно, ${review.helpfulCount}`}
          >
            <ThumbsUp size={16} strokeWidth={2} aria-hidden />
            <span>{review.helpfulCount}</span>
          </button>
          <button
            type="button"
            className={`${styles.voteBtn} ${styles.voteBtnDown} ${vote === 'down' ? styles.voteBtnDownActive : ''}`}
            onClick={() => onVote('down')}
            aria-pressed={vote === 'down'}
            aria-label={`Не полезно, ${review.notHelpfulCount}`}
          >
            <ThumbsDown size={16} strokeWidth={2} aria-hidden />
            <span>{review.notHelpfulCount}</span>
          </button>
        </div>
      </div>
    </li>
  );
}

function initVoteCounts(reviews: ProductReview[]) {
  const helpful: Record<string, number> = {};
  const notHelpful: Record<string, number> = {};
  for (const r of reviews) {
    helpful[r.id] = r.helpfulCount;
    notHelpful[r.id] = r.notHelpfulCount;
  }
  return { helpful, notHelpful };
}

export function ProductReviews({ averageRating, reviewCount }: ProductReviewsProps) {
  const initial = getInitialReviews();
  const initialCounts = initVoteCounts(initial);

  const [reviews, setReviews] = useState<ProductReview[]>(initial);
  const [totalCount, setTotalCount] = useState(reviewCount);
  const [votes, setVotes] = useState<Record<string, ReviewVote | null>>({});
  const [helpfulCounts, setHelpfulCounts] = useState(initialCounts.helpful);
  const [notHelpfulCounts, setNotHelpfulCounts] = useState(initialCounts.notHelpful);
  const [sort, setSort] = useState<ReviewSort>('newest');
  const [withPhotosOnly, setWithPhotosOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const distribution = useMemo(
    () => buildDistribution(reviews, totalCount, averageRating),
    [reviews, totalCount, averageRating],
  );

  const displayedReviews = useMemo(() => {
    const enriched = reviews.map((r) => ({
      ...r,
      helpfulCount: helpfulCounts[r.id] ?? r.helpfulCount,
      notHelpfulCount: notHelpfulCounts[r.id] ?? r.notHelpfulCount,
    }));
    return filterAndSortReviews(enriched, sort, withPhotosOnly);
  }, [reviews, sort, withPhotosOnly, helpfulCounts, notHelpfulCounts]);

  const photosCount = useMemo(() => reviews.filter((r) => r.photos.length > 0).length, [reviews]);

  const handleVote = (reviewId: string, kind: ReviewVote) => {
    setVotes((prev) => {
      const current = prev[reviewId] ?? null;
      if (current === kind) {
        if (kind === 'up') {
          setHelpfulCounts((c) => ({ ...c, [reviewId]: Math.max(0, (c[reviewId] ?? 0) - 1) }));
        } else {
          setNotHelpfulCounts((c) => ({ ...c, [reviewId]: Math.max(0, (c[reviewId] ?? 0) - 1) }));
        }
        return { ...prev, [reviewId]: null };
      }

      if (current === 'up') {
        setHelpfulCounts((c) => ({ ...c, [reviewId]: Math.max(0, (c[reviewId] ?? 0) - 1) }));
      }
      if (current === 'down') {
        setNotHelpfulCounts((c) => ({ ...c, [reviewId]: Math.max(0, (c[reviewId] ?? 0) - 1) }));
      }

      if (kind === 'up') {
        setHelpfulCounts((c) => ({ ...c, [reviewId]: (c[reviewId] ?? 0) + 1 }));
      } else {
        setNotHelpfulCounts((c) => ({ ...c, [reviewId]: (c[reviewId] ?? 0) + 1 }));
      }

      return { ...prev, [reviewId]: kind };
    });
  };

  const handleSubmitReview = (draft: ReviewDraft) => {
    const id = `user-${Date.now()}`;
    const review = draftToReview(draft, id);
    setReviews((prev) => [review, ...prev]);
    setTotalCount((c) => c + 1);
    setHelpfulCounts((prev) => ({ ...prev, [id]: 0 }));
    setNotHelpfulCounts((prev) => ({ ...prev, [id]: 0 }));
  };

  return (
    <section className={styles.section} aria-label="Отзывы покупателей">
      <div className={styles.summaryCard}>
        <div className={styles.summaryHead}>
          <div className={styles.summaryScore}>
            <span className={styles.scoreBig}>{averageRating.toFixed(1)}</span>
            <StarRating value={averageRating} reviewCount={totalCount} size="sm" />
          </div>
          <Button type="button" className={styles.writeBtn} onClick={() => setModalOpen(true)}>
            Написать отзыв
          </Button>
        </div>

        <div className={styles.distribution}>
          {distribution.map((row) => (
            <div key={row.stars} className={styles.distRow}>
              <span className={styles.distStars} aria-hidden>
                {row.stars}
              </span>
              <div className={styles.distTrack}>
                <div className={styles.distFill} style={{ width: `${row.percent}%` }} />
              </div>
              <span className={styles.distPercent}>{row.percent}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.toolbar}>
        <select
          id="review-sort"
          className={styles.sortSelect}
          value={sort}
          aria-label="Сортировка отзывов"
          onChange={(e) => setSort(e.target.value as ReviewSort)}
        >
          {REVIEW_SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <label className={styles.filterChip}>
          <input
            type="checkbox"
            checked={withPhotosOnly}
            onChange={(e) => setWithPhotosOnly(e.target.checked)}
          />
          <span>С фото</span>
          {photosCount > 0 && <span className={styles.filterBadge}>{photosCount}</span>}
        </label>
      </div>

      <p className={styles.resultsMeta}>
        {withPhotosOnly ? (
          <>
            Показано {displayedReviews.length} из {reviews.length} отзывов с фото
          </>
        ) : (
          <>Показано {displayedReviews.length} отзывов</>
        )}
      </p>

      {displayedReviews.length === 0 ? (
        <p className={styles.emptyFiltered}>
          Нет отзывов по выбранным фильтрам. Попробуйте изменить сортировку или снять фильтр «С фотографиями».
        </p>
      ) : (
        <ul className={styles.reviewList}>
          {displayedReviews.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              vote={votes[review.id] ?? null}
              onVote={(kind) => handleVote(review.id, kind)}
            />
          ))}
        </ul>
      )}

      <ReviewWriteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitReview}
      />
    </section>
  );
}
