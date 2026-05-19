/** Демо-данные списка заказов продавца. */

export type MockOrderStatus = 'delivered' | 'shipped' | 'processing' | 'pending';

export interface MockSellerOrder {
  id: string;
  number: string;
  date: string;
  dateIso: string;
  amount: number;
  status: MockOrderStatus;
  statusLabel: string;
  customerName: string;
  customerAddress: string;
}

export const MOCK_ORDERS: MockSellerOrder[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    number: 'GS-10482',
    date: '19 мая, 14:32',
    dateIso: '2026-05-19',
    amount: 12_490,
    status: 'delivered',
    statusLabel: 'Доставлен',
    customerName: 'Анна Смирнова',
    customerAddress: 'Москва, ул. Тверская, 12',
  },
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    number: 'GS-10483',
    date: '19 мая, 11:05',
    dateIso: '2026-05-19',
    amount: 8_750,
    status: 'shipped',
    statusLabel: 'В пути',
    customerName: 'Игорь Волков',
    customerAddress: 'Санкт-Петербург, Невский пр., 45',
  },
  {
    id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    number: 'GS-10484',
    date: '18 мая, 19:48',
    dateIso: '2026-05-18',
    amount: 24_300,
    status: 'processing',
    statusLabel: 'Сборка',
    customerName: 'Мария Козлова',
    customerAddress: 'Казань, ул. Баумана, 8',
  },
  {
    id: 'd4e5f6a7-b8c9-0123-def0-234567890123',
    number: 'GS-10485',
    date: '18 мая, 09:15',
    dateIso: '2026-05-18',
    amount: 5_990,
    status: 'pending',
    statusLabel: 'Новый',
    customerName: 'Дмитрий Орлов',
    customerAddress: 'Екатеринбург, ул. Ленина, 102',
  },
];

export const ORDER_STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Все статусы' },
  { value: 'processing', label: 'Сборка' },
  { value: 'shipped', label: 'В пути' },
  { value: 'delivered', label: 'Доставлен' },
  { value: 'pending', label: 'Новый' },
] as const;
