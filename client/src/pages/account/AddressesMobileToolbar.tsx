import { ChevronLeft, Plus } from 'lucide-react';
import './orders/orders-list.css';

type AddressesMobileToolbarProps = {
  count?: number;
  onBack?: () => void;
  onAdd: () => void;
};

export function AddressesMobileToolbar({ count, onBack, onAdd }: AddressesMobileToolbarProps) {
  return (
    <div className="sticky top-0 z-20 bg-[#f5f5f7]/96 pb-3 backdrop-blur-md">
      <div className="flex items-center gap-2.5">
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
        <p className="orders-archive-title m-0 min-w-0 flex-1 truncate text-gray-900">
          Адреса доставки
        </p>
        {count != null && count > 0 ? (
          <span className="shrink-0 text-[11px] font-medium leading-none text-gray-500">
            {count}{' '}
            {count === 1 ? 'адрес' : count >= 2 && count <= 4 ? 'адреса' : 'адресов'}
          </span>
        ) : null}
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-9 shrink-0 items-center gap-1 rounded-xl bg-[#FF7062] px-3 text-xs font-semibold text-white shadow-sm active:scale-[0.98]"
        >
          <Plus size={16} strokeWidth={2.5} aria-hidden />
          Добавить
        </button>
      </div>
    </div>
  );
}
