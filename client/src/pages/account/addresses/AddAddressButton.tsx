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
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#FF7062]/35 bg-white py-3.5 text-sm font-semibold text-[#FF7062] shadow-sm active:border-[#FF7062]/55 active:bg-[#FF7062]/5"
      >
        <Plus size={18} strokeWidth={2.5} aria-hidden />
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-full min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF7062] to-[#FF3D2E] px-5 text-[15px] font-semibold text-white shadow-[0_8px_24px_rgb(255_61_46/0.28)] transition-transform active:scale-[0.98]"
    >
      <Plus size={20} strokeWidth={2.5} aria-hidden />
      {label}
    </button>
  );
}
