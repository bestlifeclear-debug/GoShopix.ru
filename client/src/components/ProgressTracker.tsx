import { PROGRESS_STATUSES, getStatusDefinition, type OrderStatusSlug } from '@goshopix/shared';
import styles from './ProgressTracker.module.css';

export interface ProgressHistoryEntry {
  status: string;
  reason?: string | null;
  note?: string | null;
  createdAt: string;
  statusMeta?: { name: string; color: string; icon: string } | null;
}

interface ProgressTrackerProps {
  status: string;
  history?: ProgressHistoryEntry[];
  showHistory?: boolean;
}

const ICONS: Record<string, string> = {
  clock: '⏱',
  package: '📦',
  truck: '🚚',
  'check-circle': '✓',
  'x-circle': '✕',
  'rotate-ccw': '↩',
};

export function ProgressTracker({ status, history = [], showHistory = true }: ProgressTrackerProps) {
  const def = getStatusDefinition(status);
  const slug = status as OrderStatusSlug;

  if (status === 'cancelled' || status === 'refunded') {
    const terminal = getStatusDefinition(status);
    return (
      <div className={styles.terminal}>
        <span className={styles.terminalIcon} style={{ color: terminal?.color }}>
          {ICONS[terminal?.icon ?? ''] ?? '•'}
        </span>
        <div>
          <strong style={{ color: terminal?.color }}>{terminal?.name ?? status}</strong>
          {terminal?.description && <p className={styles.terminalDesc}>{terminal.description}</p>}
        </div>
      </div>
    );
  }

  const currentIdx = PROGRESS_STATUSES.indexOf(slug);

  return (
    <div className={styles.wrap}>
      <ol className={styles.track} aria-label="Прогресс заказа">
        {PROGRESS_STATUSES.map((step, i) => {
          const stepDef = getStatusDefinition(step);
          const done = currentIdx >= 0 && i <= currentIdx;
          const active = i === currentIdx;
          return (
            <li
              key={step}
              className={`${styles.step} ${done ? styles.done : ''} ${active ? styles.active : ''}`}
            >
              <span
                className={styles.dot}
                style={
                  active || done
                    ? { borderColor: stepDef?.color, background: done ? stepDef?.color : undefined }
                    : undefined
                }
                aria-hidden
              >
                {done ? ICONS[stepDef?.icon ?? ''] ?? '•' : ''}
              </span>
              <span className={styles.label} style={active ? { color: stepDef?.color } : undefined}>
                {stepDef?.name ?? step}
              </span>
            </li>
          );
        })}
      </ol>

      {def && (
        <p className={styles.currentDesc} style={{ borderLeftColor: def.color }}>
          {def.description}
        </p>
      )}

      {showHistory && history.length > 0 && (
        <details className={styles.history}>
          <summary>История статусов</summary>
          <ul>
            {history.map((h) => {
              const hDef = h.statusMeta ?? getStatusDefinition(h.status);
              return (
                <li key={`${h.status}-${h.createdAt}`}>
                  <span className={styles.historyDot} style={{ background: hDef?.color }} />
                  <span>
                    <strong>{hDef?.name ?? h.status}</strong>
                    {(h.reason ?? h.note) && ` — ${h.reason ?? h.note}`}
                    <time className={styles.historyTime}>
                      {new Date(h.createdAt).toLocaleString('ru-RU')}
                    </time>
                  </span>
                </li>
              );
            })}
          </ul>
        </details>
      )}
    </div>
  );
}
