import { type LucideIcon } from 'lucide-react';

type AddressSectionHeaderProps = {
  icon: LucideIcon;
  title: string;
  count: number;
  countLabel: (count: number) => string;
};

export function AddressSectionHeader({ icon: Icon, title, count, countLabel }: AddressSectionHeaderProps) {
  return (
    <div className="mb-3 flex items-center gap-2.5 px-0.5">
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#FF7062] shadow-sm ring-1 ring-gray-100"
        aria-hidden
      >
        <Icon size={16} strokeWidth={2.25} />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-[15px] font-bold leading-tight text-gray-900">{title}</h2>
        {count > 0 ? (
          <p className="mt-0.5 text-[11px] font-medium text-gray-500">{countLabel(count)}</p>
        ) : null}
      </div>
    </div>
  );
}
