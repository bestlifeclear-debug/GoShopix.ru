export interface CountryOption {
  code: string;
  name: string;
  dial: string;
  flag: string;
  minDigits: number;
  maxDigits: number;
}

export const COUNTRIES: CountryOption[] = [
  { code: 'RU', name: 'Россия', dial: '+7', flag: '🇷🇺', minDigits: 10, maxDigits: 10 },
  { code: 'BY', name: 'Беларусь', dial: '+375', flag: '🇧🇾', minDigits: 9, maxDigits: 9 },
  { code: 'KZ', name: 'Казахстан', dial: '+7', flag: '🇰🇿', minDigits: 10, maxDigits: 10 },
  { code: 'UA', name: 'Украина', dial: '+380', flag: '🇺🇦', minDigits: 9, maxDigits: 9 },
  { code: 'UZ', name: 'Узбекистан', dial: '+998', flag: '🇺🇿', minDigits: 9, maxDigits: 9 },
  { code: 'AM', name: 'Армения', dial: '+374', flag: '🇦🇲', minDigits: 8, maxDigits: 8 },
  { code: 'AZ', name: 'Азербайджан', dial: '+994', flag: '🇦🇿', minDigits: 9, maxDigits: 9 },
  { code: 'GE', name: 'Грузия', dial: '+995', flag: '🇬🇪', minDigits: 9, maxDigits: 9 },
  { code: 'KG', name: 'Кыргызстан', dial: '+996', flag: '🇰🇬', minDigits: 9, maxDigits: 9 },
  { code: 'TJ', name: 'Таджикистан', dial: '+992', flag: '🇹🇯', minDigits: 9, maxDigits: 9 },
  { code: 'DE', name: 'Германия', dial: '+49', flag: '🇩🇪', minDigits: 10, maxDigits: 11 },
  { code: 'US', name: 'США', dial: '+1', flag: '🇺🇸', minDigits: 10, maxDigits: 10 },
  { code: 'GB', name: 'Великобритания', dial: '+44', flag: '🇬🇧', minDigits: 10, maxDigits: 10 },
  { code: 'TR', name: 'Турция', dial: '+90', flag: '🇹🇷', minDigits: 10, maxDigits: 10 },
  { code: 'CN', name: 'Китай', dial: '+86', flag: '🇨🇳', minDigits: 11, maxDigits: 11 },
  { code: 'IN', name: 'Индия', dial: '+91', flag: '🇮🇳', minDigits: 10, maxDigits: 10 },
];

export const DEFAULT_COUNTRY = COUNTRIES[0];

export function formatPhoneDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, 15);
}

export function buildFullPhone(country: CountryOption, digits: string): string {
  return `${country.dial}${digits.replace(/\D/g, '')}`;
}
