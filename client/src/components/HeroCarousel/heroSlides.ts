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
  text: string;
  image: string;
  imageAlt: string;
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
    text: 'Смартфоны, ноутбуки и гаджеты — только до конца недели.',
    image: '/product-images/gophone-x-1.svg',
    imageAlt: 'Смартфон GoPhone X',
    countdownEndsAt: endOfCurrentWeek(),
    cta: { to: '/catalog?categorySlug=electronics', label: 'В каталог' },
  },
  {
    id: 'clothing',
    theme: 'fashion',
    promo: '−40%',
    eyebrow: 'Мода и стиль',
    title: 'Одежда и обувь — сезонные цены',
    text: 'Куртки, кроссовки и базовый гардероб от топ-продавцов.',
    image: '/product-images/urban-wind-jacket-1.svg',
    imageAlt: 'Куртка Urban Wind',
    cta: { to: '/catalog?categorySlug=clothing', label: 'В каталог' },
  },
  {
    id: 'audio',
    theme: 'audio',
    promo: 'Хит',
    eyebrow: 'Бестселлер',
    title: 'Наушники и аудио — топ недели',
    text: 'Проверенные модели с тысячами отзывов.',
    image: '/product-images/soundwave-pro-1.svg',
    imageAlt: 'Наушники SoundWave Pro',
    cta: { to: '/catalog?sort=popular', label: 'Смотреть хиты' },
  },
  {
    id: 'laptops',
    theme: 'laptops',
    promo: 'New',
    eyebrow: 'Новинки',
    title: 'Ноутбуки для работы и учёбы',
    text: 'Мощные конфигурации с быстрой доставкой.',
    image: '/product-images/probook-15-1.svg',
    imageAlt: 'Ноутбук ProBook 15',
    cta: { to: '/catalog?sort=newest', label: 'Новинки' },
  },
  {
    id: 'delivery',
    theme: 'delivery',
    promo: '0 ₽',
    eyebrow: 'Бесплатная доставка',
    title: 'Заказ от 2 000 ₽ — доставка бесплатно',
    text: 'Соберите корзину и получите доставку в ПВЗ за 0 ₽.',
    image: '/hero/hero-delivery.svg',
    imageAlt: 'Доставка заказа бесплатно',
    cta: { to: '/catalog', label: 'Перейти в каталог' },
  },
];

export const HERO_TRUST_ITEMS = [
  { id: 'delivery', label: 'Доставка от 1 дня', icon: '🚚' },
  { id: 'return', label: 'Возврат 14 дней', icon: '↩️' },
  { id: 'payment', label: 'Безопасная оплата', icon: '🔒' },
  { id: 'support', label: 'Поддержка покупателей', icon: '💬' },
] as const;
