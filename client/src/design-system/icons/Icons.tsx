import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

export function IconCheck(props: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M5 12l5 5L19 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconCart(props: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M6 6h15l-1.5 9H8L6 6zM6 6L5 3H2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="20" r="1.5" fill="currentColor" />
      <circle cx="18" cy="20" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconUser(props: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M5 20c0-3.314 3.134-6 7-6s7 2.686 7 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconHeart(props: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M12 20.5s-6.5-4.15-8.5-8.2C1.9 8.6 3.5 5 6.8 5c1.9 0 3.2 1 4.2 2.1C12 6.1 13.3 5 15.2 5c3.3 0 4.9 3.6 3.3 7.3-2 4.05-8.5 8.2-8.5 8.2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconChevronLeft(props: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path d="M14 6L8 12l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconChevronRight(props: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path d="M10 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconFilter(props: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M4 6h16M7 12h10M10 18h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconEye(props: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function IconEyeOff(props: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M3 3l18 18M10.5 10.7A3 3 0 0012 15a3 3 0 002.3-4.3M9.9 5.1A10.7 10.7 0 0112 5c6 0 10 7 10 7a17.5 17.5 0 01-4.1 4.6M6.1 6.1C3.6 7.8 2 12 2 12s4 7 10 7c1.5 0 2.9-.4 4.1-1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconCatalog(props: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
