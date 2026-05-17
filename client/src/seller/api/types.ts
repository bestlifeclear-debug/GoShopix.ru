import type { PaginatedMeta } from '../../api/types.js';

export interface SellerDashboard {
  metrics: {
    today: { revenue: number; orders: number };
    week: { revenue: number; orders: number };
    month: { revenue: number; orders: number };
  };
  chart: { period: string; orderCount: number; unitsSold: number; revenue: number }[];
  recentOrders: SellerOrder[];
  lowStock: {
    variantId: string;
    productId: string;
    productName: string;
    sku: string;
    variantName: string | null;
    stock: number;
    price: number;
  }[];
}

export interface SellerProductVariant {
  id: string;
  sku: string;
  name: string | null;
  price: number;
  stock: number;
  isDefault: boolean;
}

export interface SellerProductListItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  isPublished: boolean;
  imageUrl: string | null;
  category: { id: string; name: string; slug: string } | null;
  store: { id: string; name: string; slug: string };
  totalStock: number;
  variantCount: number;
  variants: SellerProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface SellerProductDetail extends SellerProductListItem {
  images: { id: string; url: string; alt: string | null; isPrimary: boolean; sortOrder: number }[];
  variants: (SellerProductVariant & {
    options: { id: string; name: string; value: string }[];
    images: { id: string; url: string; alt: string | null }[];
  })[];
}

export interface SellerOrderItem {
  id: string;
  productName: string;
  variantName: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  variantId: string | null;
  productId: string | null;
}

export interface SellerOrder {
  id: string;
  status: string;
  orderTotal: number;
  sellerRevenue: number;
  shipping: { name: string | null; phone: string | null; address: string | null };
  items: SellerOrderItem[];
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SellerOrderDetail extends SellerOrder {
  history: { id: string; status: string; note: string | null; createdAt: string }[];
  allowedStatusTransitions: string[];
  multiSeller: boolean;
}

export interface SellerStore {
  id: string;
  name: string;
  slug: string;
  description: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  images?: { id: string; url: string; alt: string | null; isPrimary: boolean }[];
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginatedMeta;
}

export interface SalesReport {
  range: { from: string | null; to: string | null };
  groupBy: string;
  totals: { orderCount: number; unitsSold: number; revenue: number };
  periods: { period: string; orderCount: number; unitsSold: number; revenue: number }[];
}

export interface TopProductsReport {
  range: { from: string | null; to: string | null };
  items: { productId: string; name: string; slug: string; unitsSold: number; revenue: number }[];
}

export interface GeographyReport {
  range: { from: string | null; to: string | null };
  regions: { region: string; orderCount: number; revenue: number; unitsSold: number }[];
}
