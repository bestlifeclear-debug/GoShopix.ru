/** Срок доставки для карточки: минимум из диапазона, иначе одно значение или fallback. */
export function resolveProductDeliveryDays(
  min: number | null | undefined,
  max: number | null | undefined,
  fallback = 1,
): number {
  if (min != null && max != null) return Math.min(min, max);
  if (min != null) return min;
  if (max != null) return max;
  return fallback;
}
