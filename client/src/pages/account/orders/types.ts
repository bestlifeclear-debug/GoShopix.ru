/** Статус для плашки в архиве заказов (завершённые / отменённые). */
export type OrderArchiveStatus = 'delivered' | 'cancelled';

export interface OrderArchiveItem {
  id: string;
  orderNumber: string;
  date: string;
  status: OrderArchiveStatus;
  statusLabel: string;
  productName: string;
  productImageUrl?: string | null;
  extraItemsCount: number;
  totalAmount: number;
}
