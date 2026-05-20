const STORAGE_KEY = 'goshopix_delivery_city';

export const DEFAULT_DELIVERY_CITY = 'Москва';

function parseStoredCity(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as { city?: unknown };
      const city = typeof parsed.city === 'string' ? parsed.city.trim() : '';
      return city || null;
    } catch {
      return null;
    }
  }
  return trimmed;
}

export function readDeliveryCity(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const city = parseStoredCity(raw);
    if (city && raw.trim().startsWith('{')) {
      writeDeliveryCity(city);
    }
    return city;
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
