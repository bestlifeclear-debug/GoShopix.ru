import jwt, { type SignOptions } from 'jsonwebtoken';
import type { UserRole } from '@prisma/client';
import { AppError } from './errors.js';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new AppError(500, 'JWT_SECRET is not configured');
  }
  return secret;
}

export function signToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, getSecret(), options);
}

export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, getSecret()) as JwtPayload;
    if (!decoded.sub || !decoded.email || !decoded.role) {
      throw new AppError(401, 'Invalid token payload');
    }
    return decoded;
  } catch {
    throw new AppError(401, 'Invalid or expired token');
  }
}
