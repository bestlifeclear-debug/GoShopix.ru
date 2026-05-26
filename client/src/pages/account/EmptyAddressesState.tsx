import { MapPin } from 'lucide-react';
import './orders/orders-list.css';

type EmptyAddressesStateProps = {
  onAdd: () => void;
};

export function EmptyAddressesState({ onAdd }: EmptyAddressesStateProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-white px-4 py-10 text-center shadow-sm ring-1 ring-gray-100/90">
      <div
        className="flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full bg-gray-100"
        aria-hidden
      >
        <MapPin className="h-9 w-9 text-gray-300" strokeWidth={1.25} />
      </div>
      <p className="mt-3 text-base font-semibold leading-snug text-gray-900">Адресов пока нет</p>
      <p className="mt-1.5 max-w-[18rem] text-sm leading-normal text-gray-500">
        Сохраните адрес — подставим его при оформлении заказа
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-gradient-to-r from-[#FF7062] to-[#FF3D2E] px-8 text-base font-semibold text-white shadow-[0_8px_24px_rgb(255_61_46/0.28)] transition-transform active:scale-[0.98]"
      >
        Добавить адрес
      </button>
    </div>
  );
}
