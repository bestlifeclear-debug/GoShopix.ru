import { paginatedMeta, parsePagination, skipTake } from '../../lib/pagination.js';

describe('pagination', () => {
  describe('parsePagination', () => {
    it('clamps page to minimum 1', () => {
      expect(parsePagination(0, 10)).toEqual({ page: 1, limit: 10 });
    });

    it('clamps limit to max', () => {
      expect(parsePagination(1, 500, 100)).toEqual({ page: 1, limit: 100 });
    });
  });

  describe('paginatedMeta', () => {
    it('calculates total pages', () => {
      expect(paginatedMeta(25, { page: 2, limit: 10 })).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
      });
    });

    it('returns at least one page when total is zero', () => {
      expect(paginatedMeta(0, { page: 1, limit: 20 }).totalPages).toBe(1);
    });
  });

  describe('skipTake', () => {
    it('computes offset for page 3', () => {
      expect(skipTake({ page: 3, limit: 10 })).toEqual({ skip: 20, take: 10 });
    });
  });
});
