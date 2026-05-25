import { formatDeliveryDateLabel } from '@goshopix/shared';
import { IconTruck } from '../../design-system/icons/Icons';
import './delivery-badge.css';

export interface DeliveryBadgeProps {
  /** Количество дней до доставки (1 — завтра, 2 — послезавтра, 3+ — дата). */
  deliveryDays: number;
  className?: string;
}

export function DeliveryBadge({ deliveryDays, className = '' }: DeliveryBadgeProps) {
  const label = formatDeliveryDateLabel(deliveryDays);
  const rootClass = [
    'mt-1.5 inline-flex w-fit max-w-full shrink-0 items-center gap-1 self-start rounded px-1.5 py-0.5',
    'bg-emerald-50 text-xs font-medium text-emerald-700',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={rootClass} title={`Доставка: ${label}`}>
      <IconTruck className="size-3 shrink-0" strokeWidth={1.5} />
      <span className="truncate leading-tight">{label}</span>
    </span>
  );
}
