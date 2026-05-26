export type SavedAddressDelivery = 'post' | 'cdek';

export interface SavedAddress {
  id: string;
  label: string;
  city: string;
  deliveryMethod: SavedAddressDelivery;
  fullAddress: string;
  isDefault: boolean;
  index?: string;
  street?: string;
  house?: string;
  apartment?: string;
  pickupPoint?: string;
}

const STORAGE_KEY = 'goshopix_saved_addresses_v1';

export const MOCK_SAVED_ADDRESSES: SavedAddress[] = [
  {
    id: 'mock-home-barnaul',
    label: 'Дом',
    city: 'Барнаул',
    deliveryMethod: 'post',
    index: '656000',
    street: 'пр. Ленина',
    house: '12',
    apartment: '45',
    fullAddress: '656000, Барнаул, пр. Ленина, д. 12, кв. 45',
    isDefault: true,
  },
  {
    id: 'mock-cdek-barnaul',
    label: 'Пункт СДЭК',
    city: 'Барнаул',
    deliveryMethod: 'cdek',
    pickupPoint: 'Барнаул-3, ул. Павловский тракт, 188',
    fullAddress: 'СДЭК, Барнаул, Барнаул-3, ул. Павловский тракт, 188',
    isDefault: false,
  },
];

function normalizeList(items: SavedAddress[]): SavedAddress[] {
  if (items.length === 0) return [];
  const hasDefault = items.some((a) => a.isDefault);
  if (hasDefault) return items;
  return items.map((a, i) => ({ ...a, isDefault: i === 0 }));
}

export function readSavedAddresses(): SavedAddress[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...MOCK_SAVED_ADDRESSES];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) return [...MOCK_SAVED_ADDRESSES];
    return normalizeList(parsed as SavedAddress[]);
  } catch {
    return [...MOCK_SAVED_ADDRESSES];
  }
}

export function writeSavedAddresses(addresses: SavedAddress[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeList(addresses)));
  } catch {
    /* ignore */
  }
}

export function formatPostAddress(parts: {
  index: string;
  city: string;
  street: string;
  house: string;
  apartment?: string;
}): string {
  const index = parts.index.replace(/\D/g, '').slice(0, 6);
  const apt = parts.apartment?.trim();
  return `${index}, ${parts.city.trim()}, ${parts.street.trim()}, д. ${parts.house.trim()}${apt ? `, кв. ${apt}` : ''}`;
}

export function formatCdekAddress(parts: { city: string; pickupPoint: string }): string {
  return `СДЭК, ${parts.city.trim()}, ${parts.pickupPoint.trim()}`;
}
