import { Clock } from 'lucide-react';
import type { SavedAddress } from '../../../lib/savedAddresses';
import { formatPickupWorkingStatus } from '../../../lib/savedAddresses';
import { AddressCardActions } from './AddressCardActions';
import { AddressRadio } from './AddressRadio';
import { PickupMapThumb } from './PickupMapThumb';
import './addresses.css';

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
          <div className="mt-0.5 flex flex-wrap items-center gap-1">
            <span className="addr-card__tag">СДЭК</span>
            <span className="addr-card__meta addr-card__meta--inline">{address.city}</span>
          </div>
          <p className="addr-card__address">{address.pickupPoint ?? address.fullAddress}</p>
          {workingStatus ? (
            <p className="addr-card__hours">
              <Clock size={11} strokeWidth={2.5} aria-hidden />
              {workingStatus}
            </p>
          ) : null}
        </div>
        {showMap ? <PickupMapThumb /> : null}
      </button>

      <AddressCardActions
        onEdit={onEdit}
        onDelete={onDelete}
        deleteLabel={`Удалить пункт ${address.label}`}
      />
    </article>
  );
}
