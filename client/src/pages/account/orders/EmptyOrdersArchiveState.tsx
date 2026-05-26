import { PackageSearch } from 'lucide-react';
import './orders-list.css';

type EmptyOrdersArchiveStateProps = {
  onResetFilters?: () => void;
};

export function EmptyOrdersArchiveState({ onResetFilters }: EmptyOrdersArchiveStateProps) {
  return (
    <div className="flex flex-col items-center px-4 py-10 text-center">
      <div
        className="flex h-[7.5rem] w-[7.5rem] items-center justify-center rounded-full bg-gray-100"
        aria-hidden
      >
        <PackageSearch className="h-10 w-10 text-gray-300" strokeWidth={1.25} />
      </div>
      <p className="mt-4 text-[1.125rem] font-semibold leading-snug text-gray-900">
        Заказов не найдено
      </p>
      <p className="mt-2 max-w-[18rem] text-sm leading-normal text-gray-500">
        Попробуйте другой статус, период или номер заказа
      </p>
      {onResetFilters ? (
        <button
          type="button"
          onClick={onResetFilters}
          className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-gradient-to-r from-[#FF7062] to-[#FF3D2E] px-8 text-base font-semibold text-white shadow-[0_8px_24px_rgb(255_61_46/0.28)] transition-transform active:scale-[0.98]"
        >
          Сбросить фильтры
        </button>
      ) : null}
    </div>
  );
}
