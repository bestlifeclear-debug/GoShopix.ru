export const DELIVERY_CITY_STORAGE_KEY = 'goshopix_delivery_city';

export type StoredDeliveryCity = {
  city: string;
  checkedAt: number;
  delivery_services: string[];
  index?: string;
  cdek_pickup_points?: { id: string; label: string }[];
};

export const DELIVERY_CITY_CHANGED_EVENT = 'goshopix-delivery-city-changed';

export function readStoredDeliveryCity(): StoredDeliveryCity | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DELIVERY_CITY_STORAGE_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as StoredDeliveryCity;
    if (!o.city || typeof o.city !== 'string') return null;
    return o;
  } catch {
    return null;
  }
}

export function writeStoredDeliveryCity(data: StoredDeliveryCity) {
  localStorage.setItem(DELIVERY_CITY_STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent(DELIVERY_CITY_CHANGED_EVENT));
}
