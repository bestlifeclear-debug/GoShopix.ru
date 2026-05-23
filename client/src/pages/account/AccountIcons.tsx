import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;

const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true as const };

export function IconOrders(props: P) {
  return (
    <svg {...base} {...props}>
      <path
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconReturns(props: P) {
  return (
    <svg {...base} {...props}>
      <path
        d="M3 10h10a4 4 0 014 4v1M3 10l4-4M3 10l4 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconFavorites(props: P) {
  return (
    <svg {...base} {...props}>
      <path
        d="M12 20.5s-6.5-4.15-8.5-8.2C1.9 8.6 3.5 5 6.8 5c1.9 0 3.2 1 4.2 2.1C12 6.1 13.3 5 15.2 5c3.3 0 4.9 3.6 3.3 7.3-2 4.05-8.5 8.2-8.5 8.2z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
    </svg>
  );
}

export function IconBonus(props: P) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 8v8M9 11h6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconProfile(props: P) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M6 19c0-2.8 2.7-5 6-5s6 2.2 6 5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconAddress(props: P) {
  return (
    <svg {...base} {...props}>
      <path
        d="M12 21s-6-5.2-6-10a6 6 0 1112 0c0 4.8-6 10-6 10z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

export function IconPayment(props: P) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

export function IconSupport(props: P) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 16v-1M12 13a2 2 0 10-2-2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconBell(props: P) {
  return (
    <svg {...base} {...props}>
      <path
        d="M18 16v-5a6 6 0 10-12 0v5l-2 2h16l-2-2zM10 20a2 2 0 004 0"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconHome(props: P) {
  return (
    <svg {...base} {...props}>
      <path
        d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconStore(props: P) {
  return (
    <svg {...base} {...props}>
      <path
        d="M4 9l2-4h12l2 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9M9 20v-6h6v6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconSettings(props: P) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconRecommend(props: P) {
  return (
    <svg {...base} {...props}>
      <path
        d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.8 7.2 17.9l.9-5.4-3.9-3.8 5.4-.8L12 3z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}
