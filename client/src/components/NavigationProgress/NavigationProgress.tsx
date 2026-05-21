import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './NavigationProgress.module.css';

/** Тонкая полоса прогресса при переходе между страницами (как на крупных маркетплейсах). */
export function NavigationProgress() {
  const { pathname, search } = useLocation();
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];

    setActive(true);
    setProgress(14);

    timers.current.push(
      window.setTimeout(() => setProgress(48), 60),
      window.setTimeout(() => setProgress(78), 180),
      window.setTimeout(() => setProgress(92), 320),
      window.setTimeout(() => {
        setProgress(100);
        timers.current.push(
          window.setTimeout(() => {
            setActive(false);
            setProgress(0);
          }, 220),
        );
      }, 420),
    );

    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    };
  }, [pathname, search]);

  return (
    <div
      className={`${styles.bar} ${active ? styles.barActive : ''}`}
      aria-hidden
    >
      <div
        className={`${styles.fill} ${progress >= 100 ? styles.fillDone : ''}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
