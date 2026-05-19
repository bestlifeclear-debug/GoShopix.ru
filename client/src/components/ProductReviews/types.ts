export interface ProductReview {
  id: string;
  authorName: string;
  date: string;
  rating: number;
  pros?: string;
  cons?: string;
  comment: string;
  photos: string[];
  helpfulCount: number;
}

export interface RatingDistributionRow {
  stars: number;
  percent: number;
  count: number;
}
