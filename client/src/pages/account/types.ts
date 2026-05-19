export type AccountSection =
  | 'dashboard'
  | 'orders'
  | 'returns'
  | 'reviews'
  | 'profile'
  | 'security'
  | 'addresses'
  | 'payments'
  | 'favorites'
  | 'lists'
  | 'subscriptions'
  | 'finance'
  | 'notifications'
  | 'support';

export interface NavItem {
  id: AccountSection;
  label: string;
  badge?: number;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}
