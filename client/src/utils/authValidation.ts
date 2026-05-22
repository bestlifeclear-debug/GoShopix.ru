const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateIdentifier(value: string): string | undefined {
  const v = value.trim();
  if (!v) return 'Укажите телефон или email';
  if (v.includes('@')) {
    if (!EMAIL_RE.test(v.toLowerCase())) return 'Некорректный формат email';
    return undefined;
  }
  const digits = v.replace(/\D/g, '');
  if (digits.length < 10) return 'Введите номер телефона или email';
  return undefined;
}

export function validateOtpCode(value: string): string | undefined {
  const v = value.trim();
  if (!v) return 'Введите код';
  if (!/^\d{6}$/.test(v)) return 'Код — 6 цифр';
  return undefined;
}

export function validatePhone(digits: string, minDigits: number): string | undefined {
  const d = digits.replace(/\D/g, '');
  if (!d) return 'Укажите номер телефона';
  if (d.length < minDigits) return 'Некорректный номер телефона';
  return undefined;
}

export function validateEmail(value: string): string | undefined {
  const v = value.trim();
  if (!v) return 'Укажите email';
  if (!EMAIL_RE.test(v)) return 'Некорректный формат email';
  return undefined;
}
