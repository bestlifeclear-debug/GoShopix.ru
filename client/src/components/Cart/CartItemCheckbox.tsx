import { Check } from 'lucide-react';

interface CartItemCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Для одиночного чекбокса без видимой подписи */
  ariaLabel: string;
  className?: string;
}

export function CartItemCheckbox({
  checked,
  onChange,
  ariaLabel,
  className = '',
}: CartItemCheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={[
        'inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span
        className={[
          'flex h-5 w-5 items-center justify-center rounded-md border-2 transition-colors duration-200',
          checked
            ? 'border-transparent bg-gradient-to-br from-[#FF7062] to-[#FF3D2E]'
            : 'border-gray-300 bg-white',
        ].join(' ')}
      >
        {checked ? <Check size={12} strokeWidth={3} className="text-white" aria-hidden /> : null}
      </span>
    </button>
  );
}
