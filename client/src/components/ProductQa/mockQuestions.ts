import type { ProductQuestion } from './types';

export function getInitialQuestions(): ProductQuestion[] {
  return [
    {
      id: 'q1',
      authorName: 'Алексей К.',
      date: '12 мая 2026',
      createdAt: '2026-05-12T10:00:00.000Z',
      question: 'Подойдёт ли для подарка?',
      answer: {
        text: 'Да, товар поставляется в фирменной упаковке — можно сразу дарить.',
        badgeLabel: 'Представитель бренда',
      },
      helpfulCount: 14,
    },
    {
      id: 'q2',
      authorName: 'Марина С.',
      date: '3 мая 2026',
      createdAt: '2026-05-03T14:30:00.000Z',
      question: 'Есть ли гарантия?',
      answer: {
        text: 'Официальная гарантия продавца 12 месяцев. Чек и гарантийный талон в комплекте.',
        badgeLabel: 'Продавец',
      },
      helpfulCount: 8,
    },
    {
      id: 'q3',
      authorName: 'Дмитрий В.',
      date: '28 апреля 2026',
      createdAt: '2026-04-28T09:15:00.000Z',
      question: 'Какой срок доставки в регионы?',
      answer: {
        text: 'В большинство городов — от 2 до 5 рабочих дней. Точный срок покажем при оформлении заказа.',
        badgeLabel: 'Представитель бренда',
      },
      helpfulCount: 5,
    },
  ];
}
