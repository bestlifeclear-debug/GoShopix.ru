import type { CSSProperties } from 'react';

/** Мобильная шапка: единый градиент (inline + CSS), десктоп не трогаем */
export const MOBILE_HEADER_MEDIA = '(max-width: 767px)';

export const MOBILE_HEADER_GRADIENT =
  'linear-gradient(180deg, #ffd6c1 0%, #ffb199 50%, #ff8878 100%)';

export const MOBILE_HEADER_SURFACE_STYLE: CSSProperties = {
  background: MOBILE_HEADER_GRADIENT,
  border: 'none',
  boxShadow: 'none',
  filter: 'none',
};

export const MOBILE_HEADER_TRANSPARENT_STYLE: CSSProperties = {
  background: 'transparent',
  border: 'none',
  boxShadow: 'none',
};
