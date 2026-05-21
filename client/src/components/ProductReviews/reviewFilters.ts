import type { ProductReview, ReviewSort } from './types';

export const REVIEW_SORT_OPTIONS: { value: ReviewSort; label: string }[] = [
  { value: 'newest', label: 'Сначала новые' },
  { value: 'helpful', label: 'Сначала полезные' },
  { value: 'rating_high', label: 'С высокой оценкой' },
  { value: 'rating_low', label: 'С низкой оценкой' },
];

export function filterAndSortReviews(
  reviews: ProductReview[],
  sort: ReviewSort,
  withPhotosOnly: boolean,
): ProductReview[] {
  let list = withPhotosOnly ? reviews.filter((r) => r.photos.length > 0) : [...reviews];

  switch (sort) {
    case 'newest':
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'helpful':
      list.sort((a, b) => {
        const scoreA = a.helpfulCount - a.notHelpfulCount;
        const scoreB = b.helpfulCount - b.notHelpfulCount;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      break;
    case 'rating_high':
      list.sort((a, b) => b.rating - a.rating || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'rating_low':
      list.sort((a, b) => a.rating - b.rating || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
  }

  return list;
}
