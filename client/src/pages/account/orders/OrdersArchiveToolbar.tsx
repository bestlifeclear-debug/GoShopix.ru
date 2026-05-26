import { Search, X } from 'lucide-react';
import type { OrderStatus } from '../../../api/types';
import './orders-list.css';

export type OrdersPeriod = '7d' | '30d' | '90d' | 'all';

const STATUS_CHIPS: { value: '' | OrderStatus; label: string }[] = [
  { value: '', label: 'Все' },
  { value: 'delivered', label: 'Доставлен' },
  { value: 'shipped', label: 'В пути' },
  { value: 'processing', label: 'В обработке' },
  { value: 'cancelled', label: 'Отменён' },
];

const PERIOD_CHIPS: { value: OrdersPeriod; label: string }[] = [
  { value: 'all', label: 'Всё время' },
  { value: '7d', label: '7 дней' },
  { value: '30d', label: '30 дней' },
  { value: '90d', label: '90 дней' },
];

type OrdersArchiveToolbarProps = {
  statusFilter: '' | OrderStatus;
  period: OrdersPeriod;
  search: string;
  onStatusChange: (value: '' | OrderStatus) => void;
  onPeriodChange: (value: OrdersPeriod) => void;
  onSearchChange: (value: string) => void;
};

function Chip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'shrink-0 rounded-full px-3.5 py-2 text-[13px] font-medium whitespace-nowrap transition-colors',
        active
          ? 'bg-[#FF7062] text-white shadow-sm'
          : 'bg-white text-gray-700 border border-gray-200 active:bg-gray-50',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

export function OrdersArchiveToolbar({
  statusFilter,
  period,
  search,
  onStatusChange,
  onPeriodChange,
  onSearchChange,
}: OrdersArchiveToolbarProps) {
  const hasSearch = search.trim().length > 0;

  return (
    <div className="sticky top-0 z-10 -mx-4 bg-[#f7f7f8]/95 px-4 pb-3 pt-0 backdrop-blur-sm">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400"
          strokeWidth={1.75}
          aria-hidden
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Номер заказа"
          className="w-full rounded-2xl border border-gray-200/80 bg-white py-3 pr-10 pl-10 text-[15px] text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-[#FF7062]/40 focus:outline-none focus:ring-2 focus:ring-[#FF7062]/15"
          enterKeyHint="search"
        />
        {hasSearch ? (
          <button
            type="button"
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 active:bg-gray-100"
            aria-label="Очистить поиск"
            onClick={() => onSearchChange('')}
          >
            <X size={16} strokeWidth={2} aria-hidden />
          </button>
        ) : null}
      </div>

      <div
        className="mt-3 flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Статус заказа"
      >
        {STATUS_CHIPS.map((chip) => (
          <Chip
            key={chip.value || 'all'}
            active={statusFilter === chip.value}
            label={chip.label}
            onClick={() => onStatusChange(chip.value)}
          />
        ))}
      </div>

      <div
        className="mt-2 flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Период"
      >
        {PERIOD_CHIPS.map((chip) => (
          <Chip
            key={chip.value}
            active={period === chip.value}
            label={chip.label}
            onClick={() => onPeriodChange(chip.value)}
          />
        ))}
      </div>
    </div>
  );
}
