import { ChevronLeft, Search, X } from 'lucide-react';
import './orders/orders-list.css';

type SupportMobileToolbarProps = {
  search: string;
  ticketsCount?: number;
  onBack?: () => void;
  onSearchChange: (value: string) => void;
};

export function SupportMobileToolbar({
  search,
  ticketsCount,
  onBack,
  onSearchChange,
}: SupportMobileToolbarProps) {
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
        <p className="orders-archive-title m-0 min-w-0 flex-1 truncate text-gray-900">Поддержка</p>
        {ticketsCount != null && ticketsCount > 0 ? (
          <span className="shrink-0 text-[11px] font-medium leading-none text-gray-500">
            {ticketsCount}{' '}
            {ticketsCount === 1
              ? 'обращение'
              : ticketsCount >= 2 && ticketsCount <= 4
                ? 'обращения'
                : 'обращений'}
          </span>
        ) : null}
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          strokeWidth={1.75}
          aria-hidden
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Поиск по вопросам"
          className="w-full rounded-xl border-0 bg-white py-2 pr-9 pl-9 text-sm text-gray-900 shadow-sm ring-1 ring-gray-200/80 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF7062]/25"
          aria-label="Поиск по базе помощи"
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
    </div>
  );
}
