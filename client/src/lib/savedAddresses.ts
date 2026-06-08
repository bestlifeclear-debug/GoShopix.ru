export type SavedAddressDelivery = 'post' | 'cdek';

/** Время работы ПВЗ в формате HH:MM */
export interface PickupWorkingHours {
  opensAt: string;
  closesAt: string;
}

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
  /** Только для ПВЗ (cdek) */
  workingHours?: PickupWorkingHours;
  /** Координаты для мини-карты ПВЗ */
  coordinates?: { lat: number; lng: number };
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
    workingHours: { opensAt: '09:00', closesAt: '21:00' },
    coordinates: { lat: 53.348, lng: 83.779 },
  },
];

function parseTimeToMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** Возвращает строку статуса работы ПВЗ, например «Открыто до 21:00». */
export function formatPickupWorkingStatus(address: SavedAddress): string | null {
  if (address.deliveryMethod !== 'cdek' || !address.workingHours) return null;
  const { opensAt, closesAt } = address.workingHours;
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = parseTimeToMinutes(opensAt);
  const closeMinutes = parseTimeToMinutes(closesAt);
  if (openMinutes == null || closeMinutes == null) {
    return `Режим работы: ${opensAt}–${closesAt}`;
  }
  if (nowMinutes >= openMinutes && nowMinutes < closeMinutes) {
    return `Открыто до ${closesAt}`;
  }
  if (nowMinutes < openMinutes) {
    return `Откроется в ${opensAt}`;
  }
  return `Закрыто · завтра с ${opensAt}`;
}

export function groupAddressesByDelivery(addresses: SavedAddress[]): {
  courier: SavedAddress[];
  pickup: SavedAddress[];
} {
  return {
    courier: addresses.filter((a) => a.deliveryMethod === 'post'),
    pickup: addresses.filter((a) => a.deliveryMethod === 'cdek'),
  };
}

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
