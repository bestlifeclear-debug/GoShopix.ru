import type { Request } from 'express';
import { isLocalOrPrivateIp, resolveClientIp } from '../lib/client-ip.js';

export type CityDetectResult = {
  city: string | null;
  source: 'dev' | 'ip-api' | 'ipwhois' | 'none';
};

/** Англоязычные названия → русские для fallback-провайдеров */
const EN_CITY_TO_RU: Record<string, string> = {
  moscow: 'Москва',
  'saint petersburg': 'Санкт-Петербург',
  'st petersburg': 'Санкт-Петербург',
  novosibirsk: 'Новосибирск',
  yekaterinburg: 'Екатеринбург',
  kazan: 'Казань',
  'nizhny novgorod': 'Нижний Новгород',
  'rostov-on-don': 'Ростов-на-Дону',
  'rostov on don': 'Ростов-на-Дону',
  krasnoyarsk: 'Красноярск',
  samara: 'Самара',
  ufa: 'Уфа',
  voronezh: 'Воронеж',
  barnaul: 'Барнаул',
  tomsk: 'Томск',
  omsk: 'Омск',
  chelyabinsk: 'Челябинск',
  perm: 'Пермь',
  volgograd: 'Волгоград',
  krasnodar: 'Краснодар',
  vladivostok: 'Владивосток',
};

const FETCH_TIMEOUT_MS = 5000;

function normalizeCityName(raw: string): string | null {
  const trimmed = raw.trim().replace(/\s+/g, ' ');
  if (!trimmed) return null;

  const latinKey = trimmed.toLowerCase();
  if (EN_CITY_TO_RU[latinKey]) return EN_CITY_TO_RU[latinKey];

  if (/[а-яё]/i.test(trimmed)) {
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }

  return trimmed;
}

function readDevCity(): string | null {
  const fromEnv = process.env.CITY_DETECT_DEV_CITY?.trim();
  if (!fromEnv) return null;
  return normalizeCityName(fromEnv);
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

/** ip-api.com — русские названия городов (бесплатный tier, HTTP). */
async function detectViaIpApi(ip: string): Promise<string | null> {
  const data = await fetchJson<{ status?: string; city?: string }>(
    `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,city&lang=ru`,
  );
  if (data?.status !== 'success' || !data.city?.trim()) return null;
  return normalizeCityName(data.city);
}

/** ipwho.is — HTTPS fallback, названия на английском. */
async function detectViaIpWhoIs(ip: string): Promise<string | null> {
  const data = await fetchJson<{ success?: boolean; city?: string }>(
    `https://ipwho.is/${encodeURIComponent(ip)}`,
  );
  if (!data?.success || !data.city?.trim()) return null;
  return normalizeCityName(data.city);
}

/** Определяет город по IP; для localhost — CITY_DETECT_DEV_CITY из .env */
export async function detectCityByIp(ip: string | null): Promise<CityDetectResult> {
  if (isLocalOrPrivateIp(ip)) {
    const devCity = readDevCity();
    return { city: devCity, source: devCity ? 'dev' : 'none' };
  }

  const safeIp = ip!.trim();

  const fromIpApi = await detectViaIpApi(safeIp);
  if (fromIpApi) return { city: fromIpApi, source: 'ip-api' };

  const fromIpWhoIs = await detectViaIpWhoIs(safeIp);
  if (fromIpWhoIs) return { city: fromIpWhoIs, source: 'ipwhois' };

  return { city: null, source: 'none' };
}

export async function detectCityFromRequest(req: Request): Promise<CityDetectResult> {
  const ip = resolveClientIp(req);
  return detectCityByIp(ip);
}
