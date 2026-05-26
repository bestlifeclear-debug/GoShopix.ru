import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import type { OrderStatus } from '../../../api/types';
import './orders-list.css';

export type OrdersPeriod = '7d' | '30d' | '90d' | 'all';

/** Архив: короткие подписи, без обрезки «В обра…» */
const STATUS_CHIPS: { value: '' | OrderStatus; label: string }[] = [
  { value: '', label: 'Все' },
  { value: 'delivered', label: 'Доставлен' },
  { value: 'shipped', label: 'В пути' },
  { value: 'cancelled', label: 'Отменён' },
];

const PERIOD_OPTIONS: { value: OrdersPeriod; label: string }[] = [
  { value: 'all', label: 'Всё время' },
  { value: '7d', label: '7 дней' },
  { value: '30d', label: '30 дней' },
  { value: '90d', label: '90 дней' },
];

type OrdersArchiveToolbarProps = {
  statusFilter: '' | OrderStatus;
  period: OrdersPeriod;
  search: string;
  ordersCount?: number;
  onBack?: () => void;
  onStatusChange: (value: '' | OrderStatus) => void;
  onPeriodChange: (value: OrdersPeriod) => void;
  onSearchChange: (value: string) => void;
};

function StatusChip({
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
        'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors',
        active
          ? 'bg-[#FF7062] text-white'
          : 'bg-white text-gray-600 ring-1 ring-gray-200/90 active:bg-gray-50',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

function PeriodFilter({
  period,
  onPeriodChange,
}: {
  period: OrdersPeriod;
  onPeriodChange: (value: OrdersPeriod) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const activeLabel = PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? 'Период';
  const isDefault = period === 'all';

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          'inline-flex items-center gap-1 rounded-full py-1.5 pr-2 pl-2.5 text-xs font-medium whitespace-nowrap transition-colors',
          isDefault
            ? 'bg-white text-gray-600 ring-1 ring-gray-200/90'
            : 'bg-[#FF7062]/10 text-[#FF7062] ring-1 ring-[#FF7062]/25',
        ].join(' ')}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <SlidersHorizontal size={13} strokeWidth={2} aria-hidden />
        <span className="max-w-[5.5rem] truncate">{activeLabel}</span>
        <ChevronDown
          size={14}
          className={['opacity-60 transition-transform', open ? 'rotate-180' : ''].join(' ')}
          aria-hidden
        />
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute right-0 top-[calc(100%+6px)] z-30 min-w-[9.5rem] overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg"
        >
          {PERIOD_OPTIONS.map((opt) => (
            <li key={opt.value} role="option" aria-selected={period === opt.value}>
              <button
                type="button"
                className={[
                  'w-full px-3 py-2 text-left text-sm',
                  period === opt.value ? 'bg-[#FF7062]/8 font-semibold text-[#FF7062]' : 'text-gray-700',
                ].join(' ')}
                onClick={() => {
                  onPeriodChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function OrdersArchiveToolbar({
  statusFilter,
  period,
  search,
  ordersCount,
  onBack,
  onStatusChange,
  onPeriodChange,
  onSearchChange,
}: OrdersArchiveToolbarProps) {
  const hasSearch = search.trim().length > 0;

  return (
    <div className="sticky top-0 z-20 bg-[#f5f5f7]/96 pb-3 backdrop-blur-md">
      <div className="flex items-center gap-2.5 pb-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-gray-800 ring-1 ring-gray-200/80 active:bg-gray-50"
            aria-label="На главную личного кабинета"
          >
            <ChevronLeft size={20} strokeWidth={2} aria-hidden />
          </button>
        ) : null}
        {/* !text-* — перебивает global.css h1 { font-size: 3xl } */}
        <h1 className="orders-archive-title m-0 min-w-0 flex-1 truncate text-gray-900">
          Мои заказы
        </h1>
        {ordersCount != null && ordersCount > 0 ? (
          <span className="shrink-0 text-[11px] font-medium leading-none text-gray-500">
            {ordersCount}{' '}
            {ordersCount === 1 ? 'заказ' : ordersCount >= 2 && ordersCount <= 4 ? 'заказа' : 'заказов'}
          </span>
        ) : null}
      </div>

      <div className="relative mb-3">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          strokeWidth={1.75}
          aria-hidden
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Номер заказа"
          className="w-full rounded-xl border-0 bg-white py-2.5 pr-9 pl-9 text-sm text-gray-900 shadow-sm ring-1 ring-gray-200/80 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF7062]/25"
          enterKeyHint="search"
        />
        {hasSearch ? (
          <button
            type="button"
            className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 active:bg-gray-100"
            aria-label="Очистить поиск"
            onClick={() => onSearchChange('')}
          >
            <X size={15} strokeWidth={2} aria-hidden />
          </button>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <div
          className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain scroll-px-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Статус заказа"
        >
          <div className="flex w-max items-center gap-1.5 px-2 py-0.5">
            {STATUS_CHIPS.map((chip) => (
              <StatusChip
                key={chip.value || 'all'}
                active={statusFilter === chip.value}
                label={chip.label}
                onClick={() => onStatusChange(chip.value)}
              />
            ))}
          </div>
        </div>
        <div className="shrink-0 pr-0.5">
          <PeriodFilter period={period} onPeriodChange={onPeriodChange} />
        </div>
      </div>
    </div>
  );
}
