import { ProgressTracker, type ProgressHistoryEntry } from './ProgressTracker';

interface OrderTrackerProps {
  status: string;
  history?: ProgressHistoryEntry[];
}

/** @deprecated Use ProgressTracker */
export function OrderTracker({ status, history }: OrderTrackerProps) {
  return <ProgressTracker status={status} history={history} />;
}
