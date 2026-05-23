export type HeroSlideTheme =
  | 'electronics'
  | 'fashion'
  | 'audio'
  | 'laptops'
  | 'delivery';

export interface HeroSlide {
  id: string;
  theme: HeroSlideTheme;
  promo: string;
  eyebrow: string;
  title: string;
  /** Подзаголовок — только десктоп; на мобилке скрыт */
  text: string;
  cta: { to: string; label: string };
  countdownEndsAt?: Date;
}

function endOfCurrentWeek(): Date {
  const d = new Date();
  const day = d.getDay();
  const add = day === 0 ? 0 : 7 - day;
  d.setDate(d.getDate() + add);
  d.setHours(23, 59, 59, 999);
  return d;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'mega-sale',
    theme: 'electronics',
    promo: '−30%',
    eyebrow: 'Мега-распродажа',
    title: 'Техника со скидкой до 30%',
    text: 'Смартфоны, ноутбуки и гаджеты до конца недели.',
    countdownEndsAt: endOfCurrentWeek(),
    cta: { to: '/catalog?categorySlug=electronics', label: 'В каталог' },
  },
  {
    id: 'clothing',
    theme: 'fashion',
    promo: '−40%',
    eyebrow: 'Мода и стиль',
    title: 'Одежда и обувь — сезонные цены',
    text: 'Куртки, кроссовки и гардероб от топ-продавцов.',
    cta: { to: '/catalog?categorySlug=clothing', label: 'В каталог' },
  },
  {
    id: 'audio',
    theme: 'audio',
    promo: 'Хит',
    eyebrow: 'Бестселлер',
    title: 'Наушники и аудио — топ недели',
    text: 'Проверенные модели с тысячами отзывов.',
    cta: { to: '/catalog?sort=popular', label: 'Смотреть хиты' },
  },
  {
    id: 'laptops',
    theme: 'laptops',
    promo: 'New',
    eyebrow: 'Новинки',
    title: 'Ноутбуки для работы и учёбы',
    text: 'Мощные конфигурации с быстрой доставкой.',
    cta: { to: '/catalog?sort=newest', label: 'Новинки' },
  },
  {
    id: 'delivery',
    theme: 'delivery',
    promo: '0 ₽',
    eyebrow: 'Бесплатная доставка',
    title: 'От 2 000 ₽ — доставка 0 ₽',
    text: 'Соберите корзину — доставка в ПВЗ бесплатно.',
    cta: { to: '/catalog', label: 'В каталог' },
  },
];

export const HERO_TRUST_ITEMS = [
  { id: 'delivery', label: 'Доставка от 1 дня', icon: '🚚' },
  { id: 'return', label: 'Возврат 14 дней', icon: '↩️' },
  { id: 'payment', label: 'Безопасная оплата', icon: '🔒' },
  { id: 'support', label: 'Поддержка покупателей', icon: '💬' },
] as const;
