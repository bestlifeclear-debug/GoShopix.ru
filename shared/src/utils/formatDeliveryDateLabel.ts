/** Текст даты доставки для бейджа карточки: «Завтра», «Послезавтра» или «28 мая». */
export function formatDeliveryDateLabel(
  deliveryDays: number,
  now: Date = new Date(),
): string {
  const days = Math.max(1, Math.round(deliveryDays));
  if (days === 1) return 'Завтра';
  if (days === 2) return 'Послезавтра';

  const date = new Date(now);
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}
