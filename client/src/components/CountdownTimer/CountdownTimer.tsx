import { useEffect, useState } from 'react';
import styles from './CountdownTimer.module.css';

interface CountdownTimerProps {
  endsAt: string | Date;
  className?: string;
  /** light — для светлых слайдов hero, dark — для тёмного фона */
  tone?: 'light' | 'dark';
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

const UNITS: { key: keyof TimeLeft; label: string }[] = [
  { key: 'days', label: 'дни' },
  { key: 'hours', label: 'часы' },
  { key: 'minutes', label: 'мин' },
  { key: 'seconds', label: 'сек' },
];

export function CountdownTimer({ endsAt, className, tone = 'dark' }: CountdownTimerProps) {
  const target = typeof endsAt === 'string' ? new Date(endsAt) : endsAt;
  const [left, setLeft] = useState<TimeLeft | null>(() => calcTimeLeft(target));

  useEffect(() => {
    const tick = () => setLeft(calcTimeLeft(target));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target.getTime()]);

  if (!left) {
    return null;
  }

  return (
    <div
      className={
        className
          ? `${styles.timer} ${styles[tone]} ${className}`
          : `${styles.timer} ${styles[tone]}`
      }
      role="timer"
      aria-live="polite"
      aria-label={`До конца акции: ${left.days} дней, ${left.hours} часов, ${left.minutes} минут`}
    >
      {UNITS.map(({ key, label }) => (
        <div key={key} className={styles.cell}>
          <span className={styles.value}>{pad(left[key])}</span>
          <span className={styles.label}>{label}</span>
        </div>
      ))}
    </div>
  );
}
