import type { CartItem } from '../api/types';
import type { GuestCartLine } from './guestCart';

export function getLinePricing(item: CartItem, compareAt: number | null | undefined) {
  const unitCompareAt =
    compareAt != null && compareAt > item.unitPrice ? compareAt : null;
  const oldLineTotal = unitCompareAt != null ? unitCompareAt * item.quantity : null;
  return { oldLineTotal, lineTotal: item.lineTotal };
}

export function buildCompareAtByProductFromGuest(
  items: GuestCartLine[],
): Record<string, number | null> {
  const map: Record<string, number | null> = {};
  for (const line of items) {
    map[line.productId] = line.compareAtPrice ?? null;
  }
  return map;
}
