import { apiFetch, buildQuery } from '../../api/client.js';
import type {
  GeographyReport,
  Paginated,
  SalesReport,
  SellerDashboard,
  SellerOrder,
  SellerOrderDetail,
  SellerProductDetail,
  SellerProductListItem,
  SellerStore,
  TopProductsReport,
} from './types.js';

export const sellerApi = {
  dashboard: () => apiFetch<SellerDashboard>('/api/seller/dashboard', { auth: true }),

  products: {
    list: (params: {
      page?: number;
      limit?: number;
      q?: string;
      isPublished?: boolean;
      categoryId?: string;
    }) =>
      apiFetch<Paginated<SellerProductListItem>>(
        `/api/seller/products${buildQuery(params)}`,
        { auth: true },
      ),
    get: (id: string) =>
      apiFetch<SellerProductDetail>(`/api/seller/products/${id}`, { auth: true }),
    create: (body: Record<string, unknown>) =>
      apiFetch<SellerProductDetail>('/api/seller/products', {
        method: 'POST',
        auth: true,
        body: JSON.stringify(body),
      }),
    update: (id: string, body: Record<string, unknown>) =>
      apiFetch<SellerProductDetail>(`/api/seller/products/${id}`, {
        method: 'PUT',
        auth: true,
        body: JSON.stringify(body),
      }),
    remove: (id: string) =>
      apiFetch<{ deleted: boolean }>(`/api/seller/products/${id}`, {
        method: 'DELETE',
        auth: true,
      }),
    patchVariant: (variantId: string, body: { price?: number; stock?: number }) =>
      apiFetch(`/api/seller/products/variants/${variantId}`, {
        method: 'PATCH',
        auth: true,
        body: JSON.stringify(body),
      }),
  },

  orders: {
    list: (params: {
      page?: number;
      limit?: number;
      status?: string;
      from?: string;
      to?: string;
    }) =>
      apiFetch<Paginated<SellerOrder>>(`/api/seller/orders${buildQuery(params)}`, {
        auth: true,
      }),
    get: (id: string) =>
      apiFetch<SellerOrderDetail>(`/api/seller/orders/${id}`, { auth: true }),
    updateStatus: (id: string, status: string, note?: string) =>
      apiFetch<SellerOrderDetail>(`/api/seller/orders/${id}/status`, {
        method: 'PUT',
        auth: true,
        body: JSON.stringify({ status, note }),
      }),
  },

  analytics: {
    sales: (params: { from?: string; to?: string; groupBy?: string }) =>
      apiFetch<SalesReport>(`/api/seller/analytics/sales${buildQuery(params)}`, {
        auth: true,
      }),
    topProducts: (params: { from?: string; to?: string; limit?: number }) =>
      apiFetch<TopProductsReport>(`/api/seller/analytics/products${buildQuery(params)}`, {
        auth: true,
      }),
    geography: (params: { from?: string; to?: string }) =>
      apiFetch<GeographyReport>(`/api/seller/analytics/geography${buildQuery(params)}`, {
        auth: true,
      }),
  },

  store: {
    get: () => apiFetch<SellerStore>('/api/seller/store', { auth: true }),
    update: (body: Record<string, unknown>) =>
      apiFetch<SellerStore>('/api/seller/store', {
        method: 'PUT',
        auth: true,
        body: JSON.stringify(body),
      }),
  },
};
