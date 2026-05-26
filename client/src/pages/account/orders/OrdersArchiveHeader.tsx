import { ChevronLeft } from 'lucide-react';
import './orders-list.css';

type OrdersArchiveHeaderProps = {
  onBack: () => void;
};

export function OrdersArchiveHeader({ onBack }: OrdersArchiveHeaderProps) {
  return (
    <header className="mb-1 flex items-center gap-2">
      <button
        type="button"
        onClick={onBack}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200/90 bg-white text-gray-800 shadow-sm active:bg-gray-50"
        aria-label="На главную личного кабинета"
      >
        <ChevronLeft size={22} strokeWidth={2} aria-hidden />
      </button>
      <h1 className="m-0 flex-1 text-[1.0625rem] font-bold leading-tight text-gray-900">
        Мои заказы
      </h1>
    </header>
  );
}
