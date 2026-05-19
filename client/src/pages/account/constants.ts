import type { NavGroup } from './types';

export const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Мои покупки',
    items: [
      { id: 'orders', label: 'Все заказы' },
      { id: 'returns', label: 'Возвраты' },
      { id: 'reviews', label: 'Отзывы' },
    ],
  },
  {
    title: 'Мой профиль',
    items: [
      { id: 'profile', label: 'Данные' },
      { id: 'security', label: 'Безопасность' },
      { id: 'addresses', label: 'Адреса' },
      { id: 'payments', label: 'Платежи' },
    ],
  },
  {
    title: 'Мои интересы',
    items: [
      { id: 'favorites', label: 'Избранное' },
      { id: 'lists', label: 'Списки' },
      { id: 'subscriptions', label: 'Подписки' },
    ],
  },
  {
    title: 'Финансы',
    items: [{ id: 'finance', label: 'Баланс и бонусы' }],
  },
  {
    title: 'Помощь',
    items: [
      { id: 'notifications', label: 'Уведомления' },
      { id: 'support', label: 'Поддержка' },
    ],
  },
];

export const SECTION_TITLES: Record<string, string> = {
  dashboard: 'Главная',
  orders: 'Все заказы',
  returns: 'Возвраты',
  reviews: 'Отзывы',
  profile: 'Личные данные',
  security: 'Безопасность',
  addresses: 'Адреса доставки',
  payments: 'Способы оплаты',
  favorites: 'Избранное',
  lists: 'Списки покупок',
  subscriptions: 'Подписки',
  finance: 'Финансы',
  notifications: 'Уведомления',
  support: 'Поддержка',
};
