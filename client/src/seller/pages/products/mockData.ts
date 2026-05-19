/** Демо-данные списка товаров продавца (фронт без бэкенда). */

export type ProductListStatus = 'active' | 'moderation' | 'draft';

export interface MockSellerProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  status: ProductListStatus;
  statusLabel: string;
}

export const MOCK_PRODUCTS: MockSellerProduct[] = [
  {
    id: 'p-soundwave',
    name: 'Наушники SoundWave Pro',
    sku: 'SW-PRO-BLK',
    category: 'Электроника',
    price: 12_990,
    compareAtPrice: 17_990,
    stock: 2,
    status: 'active',
    statusLabel: 'Активен',
  },
  {
    id: 'p-fittrack',
    name: 'Умные часы FitTrack 2',
    sku: 'FIT-2-42-BLK',
    category: 'Электроника',
    price: 8_490,
    compareAtPrice: 11_990,
    stock: 18,
    status: 'active',
    statusLabel: 'Активен',
  },
  {
    id: 'p-gophone',
    name: 'Смартфон GoPhone X',
    sku: 'GOPHONE-X-128-BLK',
    category: 'Смартфоны',
    price: 49_990,
    compareAtPrice: 64_990,
    stock: 3,
    status: 'moderation',
    statusLabel: 'На модерации',
  },
  {
    id: 'p-probook',
    name: 'Ноутбук ProBook 15',
    sku: 'PROBOOK-15-512',
    category: 'Ноутбуки',
    price: 89_990,
    compareAtPrice: 109_990,
    stock: 8,
    status: 'active',
    statusLabel: 'Активен',
  },
  {
    id: 'p-urban',
    name: 'Куртка Urban Wind M',
    sku: 'UWW-M-GR',
    category: 'Одежда',
    price: 7_490,
    stock: 0,
    status: 'draft',
    statusLabel: 'Черновик',
  },
];

export const PRODUCT_CATEGORY_OPTIONS = [
  { value: '', label: 'Все категории' },
  { value: 'Электроника', label: 'Электроника' },
  { value: 'Смартфоны', label: 'Смартфоны' },
  { value: 'Ноутбуки', label: 'Ноутбуки' },
  { value: 'Одежда', label: 'Одежда' },
] as const;
