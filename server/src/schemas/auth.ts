import { z } from 'zod';

const usernameSchema = z
  .string()
  .min(3)
  .max(30)
  .regex(/^[a-zA-Z0-9_]+$/, 'Username may only contain letters, numbers, and underscores');

export const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  username: usernameSchema,
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().min(10).max(30),
});

export const checkPhoneSchema = z.object({
  phone: z.string().min(10).max(30),
});

export const loginSchema = z.object({
  login: z.string().min(1).max(255),
  password: z.string().min(1),
});

export const loginByPhoneSchema = z.object({
  phone: z.string().min(10).max(30),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().max(255),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(16).max(128),
  password: z.string().min(8).max(128),
});

export const updateProfileSchema = z.object({
  username: usernameSchema.optional(),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  phone: z.string().min(10).max(30).optional(),
});
