import { getStatusDefinition } from '@goshopix/shared';
import { StatusBadge, type StatusBadgeProps, type StatusVariant } from '../../design-system';

const VARIANT_MAP: Record<string, StatusVariant> = {
  pending: 'warning',
  processing: 'neutral',
  shipped: 'neutral',
  delivered: 'success',
  cancelled: 'error',
  refunded: 'neutral',
};

export function OrderStatusBadge({ status, ...props }: { status: string } & Partial<StatusBadgeProps>) {
  const def = getStatusDefinition(status);
  return (
    <StatusBadge
      label={def?.name ?? status}
      variant={VARIANT_MAP[status] ?? 'neutral'}
      {...props}
    />
  );
}
