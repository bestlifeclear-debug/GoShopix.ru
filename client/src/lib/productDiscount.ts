/** Есть реальная скидка: зачёркнутая цена выше текущей */
export function hasProductDiscount(
  price: number,
  compareAtPrice?: number | null,
): boolean {
  return compareAtPrice != null && compareAtPrice > price;
}
