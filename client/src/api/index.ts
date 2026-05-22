import { apiFetch, buildQuery } from './client.js';
import type {
  AuthResponse,
  Cart,
  CategoryNode,
  FavoriteItem,
  Order,
  NotificationItem,
  NotificationSettings,
  SupportTicket,
  SupportTicketTopic,
  ProductDetail,
  ProductFacets,
  ProductsListResponse,
  User,
} from './types.js';

export interface SendOtpResponse {
  message: string;
  maskedDestination: string;
  devCode?: string;
}

export const authApi = {
  sendOtp: (identifier: string) =>
    apiFetch<SendOtpResponse>('/api/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    }),

  verifyOtp: (identifier: string, code: string) =>
    apiFetch<AuthResponse>('/api/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ identifier, code }),
    }),

  me: () => apiFetch<User>('/api/auth/me', { auth: true }),

  updateProfile: (body: { name?: string }) =>
    apiFetch<User>('/api/auth/profile', {
      method: 'PATCH',
      auth: true,
      body: JSON.stringify(body),
    }),

  sendPhoneChangeOtp: (phone: string) =>
    apiFetch<SendOtpResponse>('/api/auth/profile/phone/send-otp', {
      method: 'POST',
      auth: true,
      body: JSON.stringify({ phone }),
    }),

  verifyPhoneChange: (phone: string, code: string) =>
    apiFetch<User>('/api/auth/profile/phone/verify', {
      method: 'POST',
      auth: true,
      body: JSON.stringify({ phone, code }),
    }),

  sendEmailChangeOtp: (email: string) =>
    apiFetch<SendOtpResponse>('/api/auth/profile/email/send-otp', {
      method: 'POST',
      auth: true,
      body: JSON.stringify({ email }),
    }),

  verifyEmailChange: (email: string, code: string) =>
    apiFetch<User>('/api/auth/profile/email/verify', {
      method: 'POST',
      auth: true,
      body: JSON.stringify({ email, code }),
    }),
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
  merge: (items: { variantId: string; quantity: number }[]) =>
    apiFetch<Cart>('/api/cart/merge', {
      method: 'POST',
      auth: true,
      body: JSON.stringify({ items }),
    }),
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

export const cityDetectApi = {
  detect: () => apiFetch<{ city: string | null }>('/api/city-detect'),
};

export const supportApi = {
  listTickets: (page = 1, limit = 20) =>
    apiFetch<{ items: SupportTicket[]; meta: { page: number; limit: number; total: number; totalPages: number } }>(
      `/api/support/tickets${buildQuery({ page, limit })}`,
      { auth: true },
    ),

  getTicket: (id: string) => apiFetch<SupportTicket>(`/api/support/tickets/${id}`, { auth: true }),

  createTicket: (body: {
    topic: SupportTicketTopic;
    message: string;
    orderId?: string;
    subject?: string;
  }) =>
    apiFetch<SupportTicket>('/api/support/tickets', {
      method: 'POST',
      auth: true,
      body: JSON.stringify(body),
    }),

  reply: (ticketId: string, message: string) =>
    apiFetch<SupportTicket>(`/api/support/tickets/${ticketId}/messages`, {
      method: 'POST',
      auth: true,
      body: JSON.stringify({ message }),
    }),
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
