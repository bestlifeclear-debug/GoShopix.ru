import { z } from 'zod';
import { identifierSchema } from '../lib/identifier.js';
import { formatPhoneForStorage } from '../lib/phone.js';

export const sendOtpSchema = z.object({
  identifier: z.string().min(1).max(255),
});

export const verifyOtpSchema = z.object({
  identifier: z.string().min(1).max(255),
  code: z.string().regex(/^\d{6}$/, 'Код должен содержать 6 цифр'),
});

export const updateProfileSchema = z.object({
  name: z.string().max(200).optional(),
});

export const changePhoneSendSchema = z.object({
  phone: z.string().min(10).max(30).transform(formatPhoneForStorage),
});

export const changePhoneVerifySchema = z.object({
  phone: z.string().min(10).max(30).transform(formatPhoneForStorage),
  code: z.string().regex(/^\d{6}$/, 'Код должен содержать 6 цифр'),
});

export const changeEmailSendSchema = z.object({
  email: z.string().email().max(255).transform((v) => v.trim().toLowerCase()),
});

export const changeEmailVerifySchema = z.object({
  email: z.string().email().max(255).transform((v) => v.trim().toLowerCase()),
  code: z.string().regex(/^\d{6}$/, 'Код должен содержать 6 цифр'),
});

export { identifierSchema };
