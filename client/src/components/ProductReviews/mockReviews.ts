import type { ProductReview, RatingDistributionRow } from './types';

const MOCK_REVIEWS: ProductReview[] = [
  {
    id: 'r1',
    authorName: 'Анна С.',
    date: '15 мая 2026',
    createdAt: '2026-05-15T10:00:00.000Z',
    rating: 5,
    pros: 'Отличное шумоподавление, удобная посадка, долго держат заряд.',
    cons: 'Чехол в комплекте мог бы быть плотнее.',
    comment: 'Пользуюсь вторую неделю — звук сбалансированный, для метро идеально.',
    photos: ['/product-images/soundwave-pro-1.svg', '/product-images/soundwave-pro-2.svg'],
    helpfulCount: 24,
    notHelpfulCount: 1,
  },
  {
    id: 'r2',
    authorName: 'Игорь В.',
    date: '10 мая 2026',
    createdAt: '2026-05-10T14:30:00.000Z',
    rating: 4,
    pros: 'Качественная сборка, быстрое сопряжение с телефоном.',
    cons: 'На улице при ветре слышно чуть больше, чем хотелось бы.',
    comment: 'В целом доволен покупкой, рекомендую за эту цену.',
    photos: [],
    helpfulCount: 11,
    notHelpfulCount: 2,
  },
  {
    id: 'r3',
    authorName: 'Мария К.',
    date: '3 мая 2026',
    createdAt: '2026-05-03T09:15:00.000Z',
    rating: 5,
    pros: 'Лёгкие, не давят на уши даже после нескольких часов.',
    comment: 'Заказывала в подарок — получатель в восторге.',
    photos: ['/product-images/soundwave-pro-3.svg'],
    helpfulCount: 7,
    notHelpfulCount: 0,
  },
  {
    id: 'r4',
    authorName: 'Дмитрий О.',
    date: '28 апреля 2026',
    createdAt: '2026-04-28T18:45:00.000Z',
    rating: 3,
    cons: 'Первые дни был небольшой дискомфорт в ушах.',
    comment: 'После привыкания стало нормально, но ожидал чуть больше баса.',
    photos: [],
    helpfulCount: 3,
    notHelpfulCount: 5,
  },
];

function weightsForAverage(avg: number): number[] {
  if (avg >= 4.5) return [0.62, 0.22, 0.08, 0.05, 0.03];
  if (avg >= 4) return [0.48, 0.28, 0.12, 0.07, 0.05];
  if (avg >= 3.5) return [0.35, 0.28, 0.18, 0.12, 0.07];
  return [0.22, 0.2, 0.2, 0.18, 0.2];
}

export function buildDistribution(
  reviews: ProductReview[],
  totalCount: number,
  averageRating: number,
): RatingDistributionRow[] {
  if (reviews.length > 0) {
    const counts = [0, 0, 0, 0, 0, 0];
    for (const r of reviews) {
      const s = Math.min(5, Math.max(1, Math.round(r.rating)));
      counts[s] += 1;
    }
    const base = reviews.length;
    return [5, 4, 3, 2, 1].map((stars) => {
      const count = counts[stars];
      return {
        stars,
        count,
        percent: base > 0 ? Math.round((count / base) * 100) : 0,
      };
    });
  }

  const weights = weightsForAverage(averageRating);
  return [5, 4, 3, 2, 1].map((stars, i) => {
    const count = Math.max(0, Math.round(weights[i]! * totalCount));
    return {
      stars,
      count,
      percent: Math.round(weights[i]! * 100),
    };
  });
}

export function getInitialReviews(): ProductReview[] {
  return MOCK_REVIEWS.map((r) => ({ ...r }));
}
