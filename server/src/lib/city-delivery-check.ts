import { getCdekPickupOptions, normalizeCity } from '@goshopix/shared';
import { RUSSIAN_CITIES } from '../data/russian-cities.js';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type CacheEntry = { expires: number; result: CheckCityDeliveryResult };

const cache = new Map<string, CacheEntry>();

export type CheckCityDeliveryResult = {
  is_available: boolean;
  city: string;
  delivery_services: string[];
  cdek_pickup_points?: { id: string; label: string }[];
};

function cacheKey(city: string, index?: string) {
  return `${normalizeCity(city)}|${(index ?? '').replace(/\D/g, '')}`;
}

function canonicalDisplayName(city: string): string {
  const q = normalizeCity(city);
  const exact = RUSSIAN_CITIES.find((c) => normalizeCity(c) === q);
  if (exact) return exact;
  const trimmed = city.trim();
  if (!trimmed) return city;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function staticCdekPoints(city: string) {
  return getCdekPickupOptions(city);
}

function staticCdekHasPvz(city: string): boolean {
  return staticCdekPoints(city).length > 0;
}

/** Без DaData: считаем, что в городах из справочника есть отделения почты. */
function staticPostHasDepartments(city: string): boolean {
  const q = normalizeCity(city);
  if (q.length < 2) return false;
  return RUSSIAN_CITIES.some((c) => {
    const n = normalizeCity(c);
    return n === q || n.startsWith(q) || q.startsWith(n);
  });
}

async function fetchCdekOAuthToken(): Promise<string | null> {
  const clientId = process.env.CDEK_CLIENT_ID?.trim();
  const clientSecret = process.env.CDEK_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return null;
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });
  const res = await fetch('https://api.cdek.ru/v2/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) return null;
  const j = (await res.json()) as { access_token?: string };
  return j.access_token ?? null;
}

async function checkCdekViaApi(city: string, index?: string): Promise<boolean | null> {
  const token = await fetchCdekOAuthToken();
  if (!token) return null;

  const digits = index?.replace(/\D/g, '') ?? '';
  const params = new URLSearchParams({ type: 'PVZ', size: '20', country_code: 'RU' });
  if (digits.length === 5) {
    params.set('postal_code', digits);
  } else {
    params.set('city', city.trim());
  }

  const res = await fetch(`https://api.cdek.ru/v2/deliverypoints?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as unknown;
  return Array.isArray(data) && data.length > 0;
}

async function checkDadataPostalUnits(city: string): Promise<boolean | null> {
  const token = process.env.DADATA_API_TOKEN?.trim() ?? process.env.DADATA_TOKEN?.trim();
  if (!token) return null;

  const res = await fetch('https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/postal_unit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify({
      query: city.trim(),
      count: 5,
      filters: [{ is_closed: false }],
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) return null;
  const j = (await res.json()) as { suggestions?: unknown[] };
  return Array.isArray(j.suggestions) && j.suggestions.length > 0;
}

export async function runCityDeliveryCheck(cityRaw: string, index?: string): Promise<CheckCityDeliveryResult> {
  const city = cityRaw.trim();
  if (!city) {
    return { is_available: false, city: '', delivery_services: [] };
  }

  const key = cacheKey(city, index);
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) {
    return hit.result;
  }

  const display = canonicalDisplayName(city);

  const [cdekApiResult, dadataResult] = await Promise.all([
    checkCdekViaApi(city, index),
    checkDadataPostalUnits(city),
  ]);

  let cdekOk = cdekApiResult;
  if (cdekApiResult === null) {
    cdekOk = staticCdekHasPvz(city);
  }

  let postOk = dadataResult;
  if (dadataResult === null) {
    postOk = staticPostHasDepartments(city);
  }

  const delivery_services: string[] = [];
  if (cdekOk) delivery_services.push('СДЭК');
  if (postOk) delivery_services.push('Почта России');

  const is_available = delivery_services.length > 0;

  const points = staticCdekPoints(city);
  const cdek_pickup_points = points.length > 0 ? points : undefined;

  const result: CheckCityDeliveryResult = {
    is_available,
    city: display,
    delivery_services,
    ...(cdek_pickup_points ? { cdek_pickup_points } : {}),
  };

  cache.set(key, { expires: Date.now() + CACHE_TTL_MS, result });
  return result;
}

export function filterCitySuggestions(query: string, limit = 12): string[] {
  const q = normalizeCity(query);
  if (q.length < 3) return [];
  return RUSSIAN_CITIES.filter((c) => normalizeCity(c).includes(q)).slice(0, limit);
}
