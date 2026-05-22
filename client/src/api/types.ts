export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  details?: unknown;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UserProfile {
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  bio: string | null;
}

export interface User {
  id: string;
  email: string;
  role: string;
  profile: UserProfile | null;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
  children: CategoryNode[];
}

export interface ProductImageThumb {
  id: string;
  url: string;
  alt: string | null;
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  discountPercent: number | null;
  brand: string | null;
  rating: number;
  reviewCount: number;
  promoBadge: string | null;
  deliveryDaysMin: number | null;
  deliveryDaysMax: number | null;
  imageUrl: string | null;
  images: ProductImageThumb[];
  category: { id: string; name: string; slug: string } | null;
  store: { id: string; name: string; slug: string };
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string | null;
  price: number;
  stock: number;
  isDefault: boolean;
  options: { id: string; name: string; value: string }[];
  images: { id: string; url: string; alt: string | null }[];
}

export interface ProductGalleryImage {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductDetail extends Omit<ProductListItem, 'images'> {
  isPublished: boolean;
  deliveryDaysMin: number | null;
  deliveryDaysMax: number | null;
  images: ProductGalleryImage[];
  attributes: { slug: string; name: string; value: string }[];
  variants: ProductVariant[];
}

export interface ProductFacets {
  brands: string[];
  attributes: { slug: string; name: string; values: string[] }[];
}

export interface ProductsListResponse {
  items: ProductListItem[];
  products?: { id: string; title: string; description: string; price: number; imageUrl: string | null; createdAt: string; updatedAt: string }[];
  meta: PaginatedMeta;
}

export interface CartItem {
  id: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  variant: {
    id: string;
    sku: string;
    name: string | null;
    price: number;
    stock: number;
    options: { id: string; name: string; value: string }[];
  };
  product: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
  };
}

export interface Cart {
  id: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  updatedAt: string;
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderStatusMeta {
  slug: string;
  name: string;
  description: string;
  color: string;
  sortOrder: number;
  icon: string;
}

export interface OrderHistoryEntry {
  id: string;
  status: OrderStatus;
  note: string | null;
  reason: string | null;
  actorRole: string | null;
  statusMeta: OrderStatusMeta | null;
  createdAt: string;
}

export interface Order {
  id: string;
  status: OrderStatus;
  statusMeta: OrderStatusMeta | null;
  allowedTransitions: OrderStatus[];
  totalAmount: number;
  tracking: {
    number: string | null;
    carrier: string | null;
    carrierStatus: string | null;
    carrierStatusAt: string | null;
  };
  shipping: { name: string | null; phone: string | null; address: string | null };
  paymentMethod: 'card' | 'cash' | 'sbp' | null;
  items: {
    id: string;
    productName: string;
    variantName: string | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    variantId: string | null;
  }[];
  history: OrderHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  data: { orderId?: string; status?: string } | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationSettings {
  userId: string;
  emailOrderStatus: boolean;
  inAppOrderStatus: boolean;
  emailMarketing: boolean;
}

export interface FavoriteItem {
  id: string;
  productId: string;
  addedAt: string;
  product: ProductListItem;
}

export type SupportTicketTopic =
  | 'order'
  | 'return'
  | 'payment'
  | 'cancel'
  | 'product'
  | 'seller'
  | 'bonuses'
  | 'other';

export type SupportTicketStatus = 'open' | 'in_progress' | 'answered' | 'closed';

export interface SupportTicketMessage {
  id: string;
  authorRole: 'CUSTOMER' | 'STAFF';
  body: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  topic: SupportTicketTopic;
  topicLabel: string;
  subject: string;
  status: SupportTicketStatus;
  orderId: string | null;
  createdAt: string;
  updatedAt: string;
  lastMessagePreview: string | null;
  messages?: SupportTicketMessage[];
}
