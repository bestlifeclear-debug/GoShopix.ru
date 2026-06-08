import type { SavedAddress } from '../../../lib/savedAddresses';
import { AddressCardActions } from './AddressCardActions';
import { AddressRadio } from './AddressRadio';
import './addresses.css';

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
    <article className={['addr-card', selected ? 'addr-card--selected' : ''].filter(Boolean).join(' ')}>
      <button
        type="button"
        className="addr-card__select"
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={`${address.label}, ${address.fullAddress}${selected ? ', основной адрес' : ''}`}
      >
        <AddressRadio selected={selected} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="addr-card__title">{address.label}</p>
            {selected ? <span className="addr-card__badge">Основной</span> : null}
          </div>
          <p className="addr-card__meta">{address.city}</p>
          <p className="addr-card__address">{address.fullAddress}</p>
        </div>
      </button>

      <AddressCardActions
        onEdit={onEdit}
        onDelete={onDelete}
        deleteLabel={`Удалить адрес ${address.label}`}
      />
    </article>
  );
}
