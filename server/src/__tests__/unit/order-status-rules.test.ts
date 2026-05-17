import { OrderStatus, UserRole } from '@prisma/client';
import {
  assertStatusTransition,
  getAllowedTransitions,
  STATUS_TRANSITIONS,
} from '../../lib/order-status-rules.js';
import { AppError } from '../../lib/errors.js';

describe('order-status-rules', () => {
  describe('STATUS_TRANSITIONS graph', () => {
    it('has no transitions from terminal cancelled', () => {
      expect(STATUS_TRANSITIONS[OrderStatus.cancelled]).toEqual([]);
    });
  });

  describe('getAllowedTransitions', () => {
    it('allows seller to ship from processing', () => {
      const allowed = getAllowedTransitions(OrderStatus.processing, UserRole.SELLER);
      expect(allowed).toContain(OrderStatus.shipped);
    });

    it('allows customer only to cancel from pending', () => {
      const allowed = getAllowedTransitions(OrderStatus.pending, UserRole.CUSTOMER);
      expect(allowed).toEqual([OrderStatus.cancelled]);
    });

    it('allows admin all graph transitions', () => {
      const allowed = getAllowedTransitions(OrderStatus.pending, UserRole.ADMIN);
      expect(allowed).toEqual(STATUS_TRANSITIONS[OrderStatus.pending]);
    });
  });

  describe('assertStatusTransition', () => {
    it('throws on invalid seller transition', () => {
      expect(() =>
        assertStatusTransition(OrderStatus.delivered, OrderStatus.processing, UserRole.SELLER),
      ).toThrow(AppError);
    });

    it('allows system auto transitions', () => {
      expect(() =>
        assertStatusTransition(OrderStatus.pending, OrderStatus.processing, 'SYSTEM'),
      ).not.toThrow();
    });
  });
});
