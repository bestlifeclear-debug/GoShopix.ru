import { useEffect, useState } from 'react';
import styles from './CountdownTimer.module.css';

interface CountdownTimerProps {
  endsAt: string | Date;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(endsAt: Date): TimeLeft | null {
  const diff = endsAt.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function CountdownTimer({ endsAt, className }: CountdownTimerProps) {
  const target = typeof endsAt === 'string' ? new Date(endsAt) : endsAt;
  const [left, setLeft] = useState<TimeLeft | null>(() => calcTimeLeft(target));

  useEffect(() => {
    const tick = () => setLeft(calcTimeLeft(target));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  if (!left) {
    return (
      <p className={className ? `${styles.timer} ${className}` : styles.timer} role="timer" aria-live="polite">
        Акция завершена
      </p>
    );
  }

  return (
    <div
      className={className ? `${styles.timer} ${className}` : styles.timer}
      role="timer"
      aria-live="polite"
      aria-label={`До конца акции: ${left.days} дней, ${left.hours} часов, ${left.minutes} минут`}
    >
      <span className={styles.unit}>
        <strong>{pad(left.days)}</strong>
        <small>дн</small>
      </span>
      <span className={styles.sep} aria-hidden>
        :
      </span>
      <span className={styles.unit}>
        <strong>{pad(left.hours)}</strong>
        <small>ч</small>
      </span>
      <span className={styles.sep} aria-hidden>
        :
      </span>
      <span className={styles.unit}>
        <strong>{pad(left.minutes)}</strong>
        <small>мин</small>
      </span>
      <span className={styles.sep} aria-hidden>
        :
      </span>
      <span className={styles.unit}>
        <strong>{pad(left.seconds)}</strong>
        <small>сек</small>
      </span>
    </div>
  );
}
