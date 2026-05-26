import { ChevronLeft, Plus } from 'lucide-react';
import './orders/orders-list.css';

type AddressesMobileToolbarProps = {
  count?: number;
  onBack?: () => void;
  onAdd: () => void;
};

export function AddressesMobileToolbar({ count, onBack, onAdd }: AddressesMobileToolbarProps) {
  return (
    <div className="sticky top-0 z-20 -mx-[var(--container-padding,16px)] bg-[#f5f5f7]/96 px-[var(--container-padding,16px)] pb-4 pt-3 backdrop-blur-md">
      <div className="flex items-start gap-2">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-gray-800 ring-1 ring-gray-200/80 active:bg-gray-50"
            aria-label="На главную личного кабинета"
          >
            <ChevronLeft size={20} strokeWidth={2} aria-hidden />
          </button>
        ) : null}
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="orders-archive-title m-0 text-gray-900">Адреса доставки</p>
          {count != null && count > 0 ? (
            <p className="m-0 mt-0.5 text-[11px] font-medium leading-none text-gray-500">
              {count}{' '}
              {count === 1 ? 'адрес' : count >= 2 && count <= 4 ? 'адреса' : 'адресов'}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="mt-0.5 inline-flex h-9 shrink-0 items-center gap-1 rounded-xl bg-[#FF7062] px-3 text-xs font-semibold text-white shadow-sm active:scale-[0.98]"
        >
          <Plus size={16} strokeWidth={2.5} aria-hidden />
          Добавить
        </button>
      </div>
    </div>
  );
}
