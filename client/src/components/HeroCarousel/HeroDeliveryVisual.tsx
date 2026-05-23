/** Встроенная иллюстрация — не зависит от /hero/* на CDN и старых деплоях */
export function HeroDeliveryVisual({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 800 800"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id="hero-box" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ffe8e4" />
        </linearGradient>
        <linearGradient id="hero-accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff7062" />
          <stop offset="100%" stopColor="#ff3d2e" />
        </linearGradient>
      </defs>
      <circle cx="620" cy="140" r="120" fill="#ffffff" fillOpacity="0.12" />
      <circle cx="160" cy="680" r="160" fill="#ffffff" fillOpacity="0.08" />
      <g transform="translate(140 180)">
        <rect x="80" y="120" width="360" height="280" rx="28" fill="url(#hero-box)" stroke="#ffffff" strokeWidth="8" />
        <path d="M80 200 H440" stroke="#ffd5ce" strokeWidth="6" />
        <rect x="120" y="260" width="120" height="16" rx="8" fill="#ffb8ad" />
        <rect x="120" y="300" width="200" height="16" rx="8" fill="#ffd5ce" />
        <path d="M500 260 L620 200 V420 H500 Z" fill="url(#hero-accent)" />
        <circle cx="560" cy="420" r="44" fill="#2d3748" />
        <circle cx="560" cy="420" r="22" fill="#718096" />
        <circle cx="220" cy="420" r="44" fill="#2d3748" />
        <circle cx="220" cy="420" r="22" fill="#718096" />
        <text
          x="260"
          y="90"
          textAnchor="middle"
          fill="#ffffff"
          fontFamily="system-ui, sans-serif"
          fontSize="72"
          fontWeight="800"
        >
          0 ₽
        </text>
        <text
          x="260"
          y="145"
          textAnchor="middle"
          fill="#ffffff"
          fillOpacity="0.9"
          fontFamily="system-ui, sans-serif"
          fontSize="28"
          fontWeight="600"
        >
          доставка
        </text>
      </g>
    </svg>
  );
}
