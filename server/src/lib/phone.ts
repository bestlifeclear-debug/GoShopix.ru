/** Нормализация телефона к цифрам с кодом страны (РФ: 7XXXXXXXXXX). */
export function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('8')) {
    digits = `7${digits.slice(1)}`;
  } else if (digits.length === 10) {
    digits = `7${digits}`;
  }
  return digits;
}

export function phonesMatch(a: string, b: string): boolean {
  return normalizePhone(a) === normalizePhone(b);
}

export function formatPhoneForStorage(phone: string): string {
  const n = normalizePhone(phone);
  if (n.length === 11 && n.startsWith('7')) {
    return `+${n}`;
  }
  return phone.trim();
}
