import type { NextFunction, Request, Response } from 'express';
import { authenticate, requireRole } from './auth.js';
import { getSellerContext, type SellerContext } from '../services/seller.js';

declare global {
  namespace Express {
    interface Request {
      seller?: SellerContext;
    }
  }
}

export const requireSeller = [
  authenticate,
  requireRole('SELLER'),
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.seller = await getSellerContext(req.user!.sub);
      next();
    } catch (error) {
      next(error);
    }
  },
];
