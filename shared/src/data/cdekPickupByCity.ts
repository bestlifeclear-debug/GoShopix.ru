export type CdekPickupPoint = { id: string; label: string };

/** Мок ПВЗ до подключения CDEK API; ключ — нормализованное название города. */
export const CDEK_PICKUP_POINTS: Record<string, CdekPickupPoint[]> = {
  москва: [
    { id: 'MSK-001', label: 'ПВЗ СДЭК · Тверская, 10' },
    { id: 'MSK-002', label: 'ПВЗ СДЭК · Ленинградский пр-т, 27' },
    { id: 'MSK-003', label: 'ПВЗ СДЭК · Варшавское ш., 87' },
  ],
  'санкт-петербург': [
    { id: 'SPB-001', label: 'ПВЗ СДЭК · Невский пр-т, 114' },
    { id: 'SPB-002', label: 'ПВЗ СДЭК · Лиговский пр-т, 50' },
    { id: 'SPB-003', label: 'ПВЗ СДЭК · Московский пр-т, 149' },
  ],
  новосибирск: [
    { id: 'NSK-001', label: 'ПВЗ СДЭК · Красный пр-т, 25' },
    { id: 'NSK-002', label: 'ПВЗ СДЭК · ул. Гоголя, 33' },
  ],
  екатеринбург: [
    { id: 'EKB-001', label: 'ПВЗ СДЭК · ул. Малышева, 36' },
    { id: 'EKB-002', label: 'ПВЗ СДЭК · пр-т Ленина, 50' },
  ],
  казань: [
    { id: 'KZN-001', label: 'ПВЗ СДЭК · ул. Баумана, 9' },
    { id: 'KZN-002', label: 'ПВЗ СДЭК · пр-т Победы, 91' },
  ],
  'нижний новгород': [
    { id: 'NN-001', label: 'ПВЗ СДЭК · ул. Большая Покровская, 82' },
    { id: 'NN-002', label: 'ПВЗ СДЭК · пр-т Гагарина, 35' },
  ],
  'ростов-на-дону': [
    { id: 'RND-001', label: 'ПВЗ СДЭК · пр-т Будённовский, 15' },
    { id: 'RND-002', label: 'ПВЗ СДЭК · ул. Социалистическая, 74' },
  ],
  красноярск: [{ id: 'KRS-001', label: 'ПВЗ СДЭК · пр-т Мира, 91' }],
  самара: [{ id: 'SAM-001', label: 'ПВЗ СДЭК · ул. Ленинградская, 40' }],
  уфа: [{ id: 'UFA-001', label: 'ПВЗ СДЭК · ул. Ленина, 95' }],
  воронеж: [{ id: 'VRN-001', label: 'ПВЗ СДЭК · пр-т Революции, 47' }],
};

const CITY_ALIASES: Record<string, string> = {
  мск: 'москва',
  'санкт петербург': 'санкт-петербург',
  питер: 'санкт-петербург',
  спб: 'санкт-петербург',
  нск: 'новосибирск',
  ekb: 'екатеринбург',
  нижний: 'нижний новгород',
  'н новгород': 'нижний новгород',
  ростов: 'ростов-на-дону',
};

export function normalizeCity(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function resolveCdekCityKey(cityInput: string): string | null {
  const raw = normalizeCity(cityInput);
  if (!raw) return null;

  const alias = CITY_ALIASES[raw];
  const candidate = alias ?? raw;
  if (CDEK_PICKUP_POINTS[candidate]) return candidate;

  const keys = Object.keys(CDEK_PICKUP_POINTS);
  const exact = keys.find((k) => k === candidate);
  if (exact) return exact;

  const starts = keys.find((k) => k.startsWith(candidate) || candidate.startsWith(k));
  if (starts) return starts;

  return null;
}

export function getCdekPickupOptions(cityInput: string): CdekPickupPoint[] {
  const key = resolveCdekCityKey(cityInput);
  return key ? CDEK_PICKUP_POINTS[key] : [];
}

export const CDEK_CITY_HINTS = [
  'Москва',
  'Санкт-Петербург',
  'Новосибирск',
  'Екатеринбург',
  'Казань',
  'Нижний Новгород',
];
