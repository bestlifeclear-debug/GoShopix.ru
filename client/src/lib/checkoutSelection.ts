/** Минимальная оценка доставки в корзине (до выбора способа на checkout). */
export const CART_DELIVERY_ESTIMATE_FROM = 280;

export const FREE_DELIVERY_FROM = 2000;

export type CartLineTotals = {
  originalSubtotal: number;
  subtotal: number;
  discount: number;
  freeDelivery: boolean;
  deliveryRemaining: number;
};

export function computeLineTotals(
  items: Array<{ lineTotal: number; quantity: number; unitPrice: number; product: { id: string } }>,
  compareAtByProduct: Record<string, number | null | undefined>,
): CartLineTotals {
  let originalSubtotal = 0;
  let subtotal = 0;

  for (const item of items) {
    subtotal += item.lineTotal;
    const compareAt = compareAtByProduct[item.product.id];
    const unitOriginal =
      compareAt != null && compareAt > item.unitPrice ? compareAt : item.unitPrice;
    originalSubtotal += unitOriginal * item.quantity;
  }

  const discount = Math.max(0, originalSubtotal - subtotal);
  const freeDelivery = subtotal >= FREE_DELIVERY_FROM;

  return {
    originalSubtotal,
    subtotal,
    discount,
    freeDelivery,
    deliveryRemaining: Math.max(0, FREE_DELIVERY_FROM - subtotal),
  };
}
