import './addresses.css';

type AddressSectionHeaderProps = {
  title: string;
  count: number;
  countLabel: (count: number) => string;
};

export function AddressSectionHeader({ title, count, countLabel }: AddressSectionHeaderProps) {
  return (
    <div className="mb-2">
      <h2 className="addr-section-title">{title}</h2>
      {count > 0 ? <p className="addr-section-count">{countLabel(count)}</p> : null}
    </div>
  );
}
