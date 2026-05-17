/**
 * Единый источник дизайн-токенов GoShopix.
 * CSS-переменные в client/src/design-system/tokens/tokens.css синхронизированы с этими значениями.
 */
export const brandGradient = 'linear-gradient(180deg, #FF9D2E 0%, #FF4D4D 50%, #D81B60 100%)';

export const colors = {
  primary: '#D81B60',
  primaryHover: '#C2185B',
  primaryActive: '#AD1457',
  white: '#FFFFFF',
  bgSubtle: '#F5F5F7',
  text: '#1D1D1F',
  textMuted: '#86868B',
  success: '#34C759',
  successBg: '#E8F9ED',
  warning: '#FF9500',
  warningBg: '#FFF4E5',
  error: '#FF3B30',
  errorBg: '#FFEBEA',
  border: '#D2D2D7',
} as const;

export const fontFamily =
  "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

/** px */
export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

/** px */
export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 24,
  6: 32,
} as const;

/** px */
export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  full: 9999,
} as const;

export const layout = {
  headerHeight: 64,
  containerMax: 1200,
  touchTargetMin: 44,
} as const;

export const breakpoints = {
  sm: 768,
  md: 1024,
  lg: 1280,
} as const;

/** Генерирует объект CSS custom properties для инъекции в :root (Storybook, тесты). */
export function toCssVariables(): Record<string, string> {
  return {
    '--color-primary': colors.primary,
    '--color-primary-hover': colors.primaryHover,
    '--color-primary-active': colors.primaryActive,
    '--color-bg': colors.white,
    '--color-bg-subtle': colors.bgSubtle,
    '--color-text': colors.text,
    '--color-text-muted': colors.textMuted,
    '--color-success': colors.success,
    '--color-warning': colors.warning,
    '--color-error': colors.error,
    '--font-family': fontFamily,
    '--font-size-xs': `${fontSize.xs}px`,
    '--font-size-sm': `${fontSize.sm}px`,
    '--font-size-md': `${fontSize.md}px`,
    '--font-size-lg': `${fontSize.lg}px`,
    '--font-size-xl': `${fontSize.xl}px`,
    '--font-size-2xl': `${fontSize['2xl']}px`,
    '--font-size-3xl': `${fontSize['3xl']}px`,
    '--space-1': `${spacing[1]}px`,
    '--space-2': `${spacing[2]}px`,
    '--space-3': `${spacing[3]}px`,
    '--space-4': `${spacing[4]}px`,
    '--space-5': `${spacing[5]}px`,
    '--space-6': `${spacing[6]}px`,
    '--radius-sm': `${radius.sm}px`,
    '--radius-md': `${radius.md}px`,
    '--radius-lg': `${radius.lg}px`,
    '--header-height': `${layout.headerHeight}px`,
    '--container-max': `${layout.containerMax}px`,
  };
}
