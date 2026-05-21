export type ReviewSort = 'newest' | 'helpful' | 'rating_high' | 'rating_low';

export interface ProductReview {
  id: string;
  authorName: string;
  date: string;
  createdAt: string;
  rating: number;
  pros?: string;
  cons?: string;
  comment: string;
  photos: string[];
  helpfulCount: number;
  notHelpfulCount: number;
}

export interface RatingDistributionRow {
  stars: number;
  percent: number;
  count: number;
}
