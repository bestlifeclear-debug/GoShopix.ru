import { OrderStatus } from '@prisma/client';
import {
  assertSellerStatusTransition,
  assertValidPrice,
  assertValidSlug,
  assertValidStock,
  PRICE_MAX,
  PRICE_MIN,
  slugify,
} from '../../lib/business-rules.js';
import { AppError } from '../../lib/errors.js';

describe('business-rules', () => {
  describe('assertValidPrice', () => {
    it('accepts price in range', () => {
      expect(() => assertValidPrice(100)).not.toThrow();
    });

    it('rejects price below minimum', () => {
      expect(() => assertValidPrice(0)).toThrow(AppError);
    });

    it('rejects price above maximum', () => {
      expect(() => assertValidPrice(PRICE_MAX + 1)).toThrow(AppError);
    });

    it('rejects non-finite values', () => {
      expect(() => assertValidPrice(Number.NaN)).toThrow(AppError);
    });
  });

  describe('assertValidStock', () => {
    it('accepts valid integer stock', () => {
      expect(() => assertValidStock(10)).not.toThrow();
    });

    it('rejects fractional stock', () => {
      expect(() => assertValidStock(1.5)).toThrow(AppError);
    });
  });

  describe('assertValidSlug', () => {
    it('accepts valid slug', () => {
      expect(() => assertValidSlug('wireless-headphones')).not.toThrow();
    });

    it('rejects uppercase slug', () => {
      expect(() => assertValidSlug('Bad-Slug')).toThrow(AppError);
    });
  });

  describe('slugify', () => {
    it('normalizes product name', () => {
      expect(slugify('  Wireless Headphones  ')).toBe('wireless-headphones');
    });
  });

  describe('assertSellerStatusTransition', () => {
    it('allows pending → processing', () => {
      expect(() =>
        assertSellerStatusTransition(OrderStatus.pending, OrderStatus.processing),
      ).not.toThrow();
    });

    it('blocks delivered → pending', () => {
      expect(() =>
        assertSellerStatusTransition(OrderStatus.delivered, OrderStatus.pending),
      ).toThrow(AppError);
    });
  });

  describe('constants', () => {
    it('has sensible price bounds', () => {
      expect(PRICE_MIN).toBeGreaterThan(0);
      expect(PRICE_MAX).toBeGreaterThan(PRICE_MIN);
    });
  });
});
