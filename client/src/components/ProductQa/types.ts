export interface ProductQuestion {
  id: string;
  authorName: string;
  date: string;
  createdAt: string;
  question: string;
  answer: {
    text: string;
    badgeLabel: string;
  };
  helpfulCount: number;
}
