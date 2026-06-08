import './addresses.css';

type AddressRadioProps = {
  selected: boolean;
};

export function AddressRadio({ selected }: AddressRadioProps) {
  return (
    <span
      className={['addr-card__radio', selected ? 'addr-card__radio--on' : ''].filter(Boolean).join(' ')}
      aria-hidden
    >
      {selected ? <span className="addr-card__radio-dot" /> : null}
    </span>
  );
}
