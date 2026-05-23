import { useEffect, useState } from 'react';

const MOBILE_LK_QUERY = '(max-width: 480px)';

/** Компактная мобильная вёрстка ЛК (целевое разрешение ~320px). */
export function useAccountMobileLayout() {
  const [isCompact, setIsCompact] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_LK_QUERY).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_LK_QUERY);
    const sync = () => setIsCompact(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return isCompact;
}
