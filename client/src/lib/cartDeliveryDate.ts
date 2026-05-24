/** Дата доставки: сегодня + N дней, локализованная строка (например, «31 мая»). */
export function formatEstimatedDeliveryDate(daysAhead = 7): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}
