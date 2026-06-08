import { ChevronLeft } from 'lucide-react';
import './orders/orders-list.css';

type ProfileMobileToolbarProps = {
  onBack?: () => void;
};

export function ProfileMobileToolbar({ onBack }: ProfileMobileToolbarProps) {
  return (
    <div className="sticky top-0 z-20 -mx-[var(--container-padding,16px)] bg-[#f5f5f7]/96 px-[var(--container-padding,16px)] pb-3 pt-2 backdrop-blur-md">
      <div className="flex items-center gap-2">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-white text-gray-800 ring-1 ring-gray-200/80 active:bg-gray-50"
            aria-label="На главную личного кабинета"
          >
            <ChevronLeft size={18} strokeWidth={2} aria-hidden />
          </button>
        ) : null}
        <p className="orders-archive-title m-0 min-w-0 flex-1 text-gray-900">Личные данные</p>
      </div>
    </div>
  );
}
