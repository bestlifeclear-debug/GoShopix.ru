const STORAGE_KEY = 'goshopix_delivery_city';

export const DEFAULT_DELIVERY_CITY = 'Москва';

export function readDeliveryCity(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const city = raw?.trim();
    return city || null;
  } catch {
    return null;
  }
}

export function writeDeliveryCity(city: string): void {
  const trimmed = city.trim();
  if (!trimmed) return;
  try {
    localStorage.setItem(STORAGE_KEY, trimmed);
  } catch {
    /* ignore quota / private mode */
  }
}
