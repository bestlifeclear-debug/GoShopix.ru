import { z } from 'zod';
import { formatPhoneForStorage } from './phone.js';

export type IdentifierKind = 'phone' | 'email';

export interface ParsedIdentifier {
  kind: IdentifierKind;
  value: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseIdentifier(raw: string): ParsedIdentifier {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error('EMPTY');
  }
  if (trimmed.includes('@')) {
    const email = trimmed.toLowerCase();
    if (!EMAIL_RE.test(email)) {
      throw new Error('INVALID_EMAIL');
    }
    return { kind: 'email', value: email };
  }
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length >= 10) {
    return { kind: 'phone', value: formatPhoneForStorage(trimmed) };
  }
  throw new Error('INVALID');
}

export const identifierSchema = z
  .string()
  .min(1, 'Укажите телефон или email')
  .max(255)
  .transform((v, ctx) => {
    try {
      return parseIdentifier(v);
    } catch (e) {
      const code = e instanceof Error ? e.message : 'INVALID';
      if (code === 'INVALID_EMAIL') {
        ctx.addIssue({ code: 'custom', message: 'Некорректный email' });
      } else if (code === 'EMPTY') {
        ctx.addIssue({ code: 'custom', message: 'Укажите телефон или email' });
      } else {
        ctx.addIssue({ code: 'custom', message: 'Введите телефон или email' });
      }
      return z.NEVER;
    }
  });

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '***';
  return `***${digits.slice(-4)}`;
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const visible = local.length <= 2 ? '*' : local.slice(0, 2);
  return `${visible}***@${domain}`;
}
