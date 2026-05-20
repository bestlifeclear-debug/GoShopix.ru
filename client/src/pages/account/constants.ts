import type { ComponentType, SVGProps } from 'react';
import {
  IconAddress,
  IconBell,
  IconBonus,
  IconFavorites,
  IconHome,
  IconOrders,
  IconPayment,
  IconProfile,
  IconReturns,
  IconSupport,
} from './AccountIcons';
import type { AccountSection } from './types';

/** Разделы-заглушки скрываем из меню, пока нет экранов */
export const HIDDEN_ACCOUNT_SECTIONS: ReadonlySet<AccountSection> = new Set([
  'payments',
  'finance',
  'returns',
]);

export interface SidebarNavItem {
  id: AccountSection;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

/** Плоское меню ЛК — как на Ozon/WB */
export const SIDEBAR_NAV: SidebarNavItem[] = [
  { id: 'dashboard', label: 'Главная', icon: IconHome },
  { id: 'orders', label: 'Мои заказы', icon: IconOrders },
  { id: 'returns', label: 'Возвраты', icon: IconReturns },
  { id: 'favorites', label: 'Избранное', icon: IconFavorites },
  { id: 'finance', label: 'Баллы и бонусы', icon: IconBonus },
  { id: 'profile', label: 'Личные данные', icon: IconProfile },
  { id: 'addresses', label: 'Адреса', icon: IconAddress },
  { id: 'payments', label: 'Способы оплаты', icon: IconPayment },
  { id: 'notifications', label: 'Уведомления', icon: IconBell },
  { id: 'support', label: 'Поддержка', icon: IconSupport },
];

export const SIDEBAR_NAV_MAIN: SidebarNavItem[] = SIDEBAR_NAV.filter(
  (item) => !HIDDEN_ACCOUNT_SECTIONS.has(item.id),
);

export const SECTION_TITLES: Record<string, string> = {
  dashboard: 'Главная',
  orders: 'Мои заказы',
  returns: 'Возвраты',
  reviews: 'Отзывы',
  profile: 'Личные данные',
  security: 'Безопасность',
  addresses: 'Адреса доставки',
  payments: 'Способы оплаты',
  favorites: 'Избранное',
  lists: 'Списки покупок',
  subscriptions: 'Подписки',
  finance: 'Баллы и бонусы',
  notifications: 'Уведомления',
  support: 'Поддержка',
};
