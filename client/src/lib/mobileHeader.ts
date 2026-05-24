import type { CSSProperties } from 'react';

/** Мобильная шапка: единый градиент (inline + CSS), десктоп не трогаем */
export const MOBILE_HEADER_MEDIA = '(max-width: 767px)';

export const MOBILE_HEADER_GRADIENT =
  'linear-gradient(180deg, #ffb89a 0%, #ff9078 52%, #ff6e62 100%)';

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
