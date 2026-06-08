import { Clock, MapPin, Package, Pencil, Trash2 } from 'lucide-react';
import type { SavedAddress } from '../../../lib/savedAddresses';
import { formatPickupWorkingStatus } from '../../../lib/savedAddresses';

type PickupAddressCardProps = {
  address: SavedAddress;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  showMap?: boolean;
};

export function PickupAddressCard({
  address,
  selected,
  onSelect,
  onEdit,
  onDelete,
  showMap = true,
}: PickupAddressCardProps) {
  const workingStatus = formatPickupWorkingStatus(address);

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
          <Package size={20} strokeWidth={2} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[15px] font-bold leading-tight text-gray-900">{address.label}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                  СДЭК
                </span>
                <span className="text-xs font-medium text-gray-500">{address.city}</span>
              </div>
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

          {workingStatus ? (
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
              <Clock size={13} strokeWidth={2.25} aria-hidden />
              {workingStatus}
            </p>
          ) : null}

          {selected ? (
            <span className="mt-2.5 inline-flex rounded-md bg-[#FF7062]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#FF7062]">
              По умолчанию
            </span>
          ) : null}
        </div>
      </button>

      {showMap ? (
        <div
          className="relative mx-4 mb-3 h-[88px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-50 ring-1 ring-gray-100"
          aria-hidden
        >
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md ring-2 ring-[#FF7062]/30">
              <MapPin size={18} className="text-[#FF7062]" strokeWidth={2.25} />
            </span>
          </div>
          <span className="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-medium text-gray-600 backdrop-blur-sm">
            Мини-карта
          </span>
        </div>
      ) : null}

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
          aria-label={`Удалить пункт ${address.label}`}
        >
          <Trash2 size={16} strokeWidth={2} aria-hidden />
        </button>
      </div>
    </article>
  );
}
