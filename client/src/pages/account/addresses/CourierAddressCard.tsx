import { Home, Pencil, Trash2 } from 'lucide-react';
import type { SavedAddress } from '../../../lib/savedAddresses';

type CourierAddressCardProps = {
  address: SavedAddress;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function CourierAddressCard({
  address,
  selected,
  onSelect,
  onEdit,
  onDelete,
}: CourierAddressCardProps) {
  return (
    <article
      className={[
        'overflow-hidden rounded-2xl bg-white transition-shadow',
        selected
          ? 'shadow-md ring-2 ring-[#FF7062]/80'
          : 'shadow-sm ring-1 ring-gray-100/90',
      ].join(' ')}
    >
      <button
        type="button"
        className="flex w-full items-start gap-3 px-4 py-4 text-left active:bg-gray-50/80"
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={`${address.label}, ${address.fullAddress}${selected ? ', выбран по умолчанию' : ''}`}
      >
        <span
          className={[
            'mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            selected ? 'bg-[#FF7062]/15 text-[#FF7062]' : 'bg-[#FF7062]/10 text-[#FF7062]',
          ].join(' ')}
          aria-hidden
        >
          <Home size={20} strokeWidth={2} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[15px] font-bold leading-tight text-gray-900">{address.label}</p>
              <p className="mt-1 text-xs font-medium text-gray-500">{address.city}</p>
            </div>
            <span
              className={[
                'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                selected ? 'border-[#FF7062] bg-[#FF7062]' : 'border-gray-300 bg-white',
              ].join(' ')}
              aria-hidden
            >
              {selected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
            </span>
          </div>

          <p className="mt-2.5 text-sm leading-snug text-gray-700">{address.fullAddress}</p>

          {selected ? (
            <span className="mt-2.5 inline-flex rounded-md bg-[#FF7062]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#FF7062]">
              По умолчанию
            </span>
          ) : null}
        </div>
      </button>

      <div className="flex items-center gap-2 border-t border-gray-100 px-4 py-2.5">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gray-50 py-2.5 text-sm font-semibold text-gray-800 active:bg-gray-100"
        >
          <Pencil size={15} strokeWidth={2} aria-hidden />
          Редактировать
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-400 active:bg-red-50 active:text-red-500"
          aria-label={`Удалить адрес ${address.label}`}
        >
          <Trash2 size={16} strokeWidth={2} aria-hidden />
        </button>
      </div>
    </article>
  );
}
