const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;

export function validateEmail(value: string): string | undefined {
  const v = value.trim();
  if (!v) return 'Укажите email';
  if (!EMAIL_RE.test(v)) return 'Некорректный формат email';
  return undefined;
}

export function validateLogin(value: string): string | undefined {
  const v = value.trim();
  if (!v) return 'Укажите логин или email';
  if (v.includes('@')) return validateEmail(v);
  if (!USERNAME_RE.test(v)) {
    return 'Логин: 3–30 символов, латиница, цифры и _';
  }
  return undefined;
}

export function validateUsername(value: string): string | undefined {
  const v = value.trim();
  if (!v) return 'Укажите логин';
  if (!USERNAME_RE.test(v)) {
    return 'Логин: 3–30 символов, только латиница, цифры и _';
  }
  return undefined;
}

export function validatePassword(value: string, strict = false): string | undefined {
  if (!value) return 'Укажите пароль';
  if (value.length < 8) return 'Минимум 8 символов';
  if (strict && (!/[A-Za-z]/.test(value) || !/\d/.test(value))) {
    return 'Пароль должен содержать буквы и цифры';
  }
  return undefined;
}

export function validatePhone(digits: string, minDigits: number): string | undefined {
  const d = digits.replace(/\D/g, '');
  if (!d) return 'Укажите номер телефона';
  if (d.length < minDigits) return 'Некорректный номер телефона';
  return undefined;
}

export function getPasswordStrength(value: string): 'weak' | 'medium' | 'strong' | null {
  if (!value) return null;
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  if (score <= 2) return 'weak';
  if (score <= 3) return 'medium';
  return 'strong';
}
