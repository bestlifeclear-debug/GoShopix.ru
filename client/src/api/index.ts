import { apiFetch, buildQuery } from './client.js';
import type {
  AuthResponse,
  Cart,
  CategoryNode,
  FavoriteItem,
  Order,
  NotificationItem,
  NotificationSettings,
  ProductDetail,
  ProductFacets,
  ProductsListResponse,
  User,
} from './types.js';

export interface CheckPhoneResponse {
  exists: boolean;
  maskedEmail?: string;
}

export interface ForgotPasswordResponse {
  message: string;
  devToken?: string;
}

export const authApi = {
  checkPhone: (phone: string) =>
    apiFetch<CheckPhoneResponse>('/api/auth/check-phone', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  register: (body: {
    email: string;
    password: string;
    username: string;
    firstName?: string;
    lastName?: string;
    phone: string;
  }) => apiFetch<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (login: string, password: string) =>
    apiFetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ login, password }),
    }),

  loginByPhone: (phone: string, password: string) =>
    apiFetch<AuthResponse>('/api/auth/login-phone', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    }),

  forgotPassword: (email: string) =>
    apiFetch<ForgotPasswordResponse>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    apiFetch<AuthResponse>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),

  me: () => apiFetch<User>('/api/auth/me', { auth: true }),
};

export const productsApi = {
  list: (params: Record<string, string | number | boolean | undefined>) =>
    apiFetch<ProductsListResponse>(`/api/products${buildQuery(params)}`),

  facets: (params?: { categorySlug?: string }) =>
    apiFetch<ProductFacets>(`/api/products/facets${buildQuery(params ?? {})}`),

  get: (id: string) => apiFetch<ProductDetail>(`/api/products/${id}`),
};

export const categoriesApi = {
  tree: () => apiFetch<CategoryNode[]>('/api/categories'),
};

export const cartApi = {
  get: () => apiFetch<Cart>('/api/cart', { auth: true }),
  addItem: (variantId: string, quantity = 1) =>
    apiFetch<Cart>('/api/cart/items', {
      method: 'POST',
      auth: true,
      body: JSON.stringify({ variantId, quantity }),
    }),
  updateItem: (id: string, quantity: number) =>
    apiFetch<Cart>(`/api/cart/items/${id}`, {
      method: 'PUT',
      auth: true,
      body: JSON.stringify({ quantity }),
    }),
  removeItem: (id: string) =>
    apiFetch<Cart>(`/api/cart/items/${id}`, { method: 'DELETE', auth: true }),
};

export const ordersApi = {
  list: (page = 1, limit = 10) =>
    apiFetch<{ items: Order[]; meta: { page: number; limit: number; total: number; totalPages: number } }>(
      `/api/orders${buildQuery({ page, limit })}`,
      { auth: true },
    ),

  get: (id: string) => apiFetch<Order>(`/api/orders/${id}`, { auth: true }),

  create: (body: {
    shippingName: string;
    shippingPhone: string;
    shippingAddress: string;
    paymentMethod?: 'card' | 'cash' | 'sbp';
    deliveryMethod?: 'post' | 'cdek';
    customerNote?: string;
  }) =>
    apiFetch<Order>('/api/orders', {
      method: 'POST',
      auth: true,
      body: JSON.stringify(body),
    }),

  pay: (id: string) => apiFetch<Order>(`/api/orders/${id}/pay`, { method: 'POST', auth: true }),

  paymentRedirect: (id: string, body: { paymentMethod: 'card' | 'sbp'; returnUrl?: string }) =>
    apiFetch<{ redirectUrl: string }>(`/api/orders/${id}/payment-redirect`, {
      method: 'POST',
      auth: true,
      body: JSON.stringify(body),
    }),

  cancel: (id: string) => apiFetch<Order>(`/api/orders/${id}/cancel`, { method: 'POST', auth: true }),
};

export const notificationsApi = {
  list: (page = 1, limit = 20, unreadOnly = false) =>
    apiFetch<{ items: NotificationItem[]; meta: { total: number } }>(
      `/api/notifications${buildQuery({ page, limit, unread: unreadOnly ? 'true' : undefined })}`,
      { auth: true },
    ),
  unreadCount: () => apiFetch<{ count: number }>('/api/notifications/unread-count', { auth: true }),
  markRead: (id: string) =>
    apiFetch<{ success: boolean }>(`/api/notifications/${id}/read`, { method: 'POST', auth: true }),
  markAllRead: () =>
    apiFetch<{ success: boolean }>('/api/notifications/read-all', { method: 'POST', auth: true }),
  getSettings: () => apiFetch<NotificationSettings>('/api/notifications/settings', { auth: true }),
  updateSettings: (body: Partial<NotificationSettings>) =>
    apiFetch<NotificationSettings>('/api/notifications/settings', {
      method: 'PUT',
      auth: true,
      body: JSON.stringify(body),
    }),
};

export const orderStatusesApi = {
  list: () =>
    apiFetch<{ items: import('@goshopix/shared').OrderStatusDefinition[] }>('/api/order-statuses'),
};

export const favoritesApi = {
  list: () => apiFetch<FavoriteItem[]>('/api/favorites', { auth: true }),
  add: (productId: string) =>
    apiFetch<FavoriteItem>(`/api/favorites/${productId}`, { method: 'POST', auth: true }),
  remove: (productId: string) =>
    apiFetch<{ removed: boolean; productId: string }>(`/api/favorites/${productId}`, {
      method: 'DELETE',
      auth: true,
    }),
};
