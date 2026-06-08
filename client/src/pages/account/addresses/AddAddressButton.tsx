import { Plus } from 'lucide-react';

type AddAddressButtonProps = {
  onClick: () => void;
  variant?: 'primary' | 'dashed';
  label?: string;
};

export function AddAddressButton({
  onClick,
  variant = 'primary',
  label = 'Добавить адрес',
}: AddAddressButtonProps) {
  if (variant === 'dashed') {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center justify-center gap-1.5 rounded-[14px] border border-dashed border-[#FF7062]/30 bg-white py-3 text-[13px] font-medium text-[#FF7062] active:border-[#FF7062]/50 active:bg-[#FF7062]/[0.03]"
      >
        <Plus size={16} strokeWidth={2.5} aria-hidden />
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-full min-h-[44px] items-center justify-center gap-1.5 rounded-[14px] bg-gradient-to-r from-[#FF7062] to-[#FF3D2E] px-4 text-[14px] font-semibold text-white shadow-[0_4px_16px_rgb(255_61_46/0.22)] transition-transform active:scale-[0.99]"
    >
      <Plus size={18} strokeWidth={2.5} aria-hidden />
      {label}
    </button>
  );
}
