import type { UserRole } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../lib/errors.js';
import { verifyToken, type JwtPayload } from '../lib/jwt.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice(7).trim() || null;
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token = extractBearerToken(req);
  if (!token) {
    next(new AppError(401, 'Authentication required'));
    return;
  }
  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new AppError(401, 'Authentication required'));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new AppError(403, 'Insufficient permissions'));
      return;
    }
    next();
  };
}

/** Покупательские эндпоинты: покупатель, продавец (тоже может покупать) и админ */
export const requireCustomer = [authenticate, requireRole('CUSTOMER', 'SELLER', 'ADMIN')];
