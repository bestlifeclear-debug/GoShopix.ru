import type { ReactNode } from 'react';
import type { HeroSlideTheme } from './heroSlides';

interface HeroSlideVisualProps {
  theme: HeroSlideTheme;
  className?: string;
}

/** Стилизованные иллюстрации для hero — без внешних product-images */
export function HeroSlideVisual({ theme, className }: HeroSlideVisualProps) {
  switch (theme) {
    case 'electronics':
      return <ElectronicsVisual className={className} />;
    case 'fashion':
      return <FashionVisual className={className} />;
    case 'audio':
      return <AudioVisual className={className} />;
    case 'laptops':
      return <LaptopsVisual className={className} />;
    case 'delivery':
      return <DeliveryVisual className={className} />;
    default:
      return null;
  }
}

function SvgRoot({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 800 800"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-hidden
      focusable="false"
    >
      {children}
    </svg>
  );
}

function ElectronicsVisual({ className }: { className?: string }) {
  return (
    <SvgRoot className={className}>
      <defs>
        <linearGradient id="hero-el-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e8ecff" />
        </linearGradient>
        <linearGradient id="hero-el-screen" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <circle cx="640" cy="120" r="110" fill="#ffffff" fillOpacity="0.14" />
      <circle cx="120" cy="660" r="150" fill="#ffffff" fillOpacity="0.08" />
      <g transform="translate(220 120)">
        <rect x="0" y="0" width="280" height="520" rx="48" fill="url(#hero-el-body)" stroke="#fff" strokeWidth="10" />
        <rect x="24" y="48" width="232" height="400" rx="24" fill="url(#hero-el-screen)" />
        <rect x="100" y="468" width="80" height="12" rx="6" fill="#c7d2fe" />
        <circle cx="140" cy="88" r="10" fill="#fff" fillOpacity="0.5" />
        <text
          x="140"
          y="280"
          textAnchor="middle"
          fill="#fff"
          fontFamily="system-ui, sans-serif"
          fontSize="56"
          fontWeight="800"
        >
          −30%
        </text>
      </g>
    </SvgRoot>
  );
}

function FashionVisual({ className }: { className?: string }) {
  return (
    <SvgRoot className={className}>
      <defs>
        <linearGradient id="hero-fa-coat" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ffe4f0" />
        </linearGradient>
      </defs>
      <circle cx="620" cy="150" r="100" fill="#ffffff" fillOpacity="0.12" />
      <circle cx="140" cy="640" r="140" fill="#ffffff" fillOpacity="0.08" />
      <g transform="translate(200 100)">
        <path d="M200 40 L260 40 L280 100 L320 520 L80 520 L100 100 Z" fill="url(#hero-fa-coat)" stroke="#fff" strokeWidth="10" strokeLinejoin="round" />
        <path d="M200 40 L200 120 L160 200 L240 200 L200 120" fill="#ffd5e8" stroke="#fff" strokeWidth="6" />
        <rect x="120" y="280" width="160" height="14" rx="7" fill="#ffb8d4" />
        <rect x="120" y="320" width="120" height="14" rx="7" fill="#ffd5e8" />
        <circle cx="200" cy="60" r="28" fill="none" stroke="#fff" strokeWidth="8" />
      </g>
    </SvgRoot>
  );
}

function AudioVisual({ className }: { className?: string }) {
  return (
    <SvgRoot className={className}>
      <defs>
        <linearGradient id="hero-au-cup" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ede9fe" />
        </linearGradient>
        <linearGradient id="hero-au-band" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
      </defs>
      <circle cx="640" cy="130" r="105" fill="#ffffff" fillOpacity="0.12" />
      <circle cx="130" cy="650" r="145" fill="#ffffff" fillOpacity="0.08" />
      <g transform="translate(140 200)">
        <path
          d="M120 80 C80 80 60 120 60 200 V320 C60 400 80 440 120 440 H160 V80 H120 Z M380 80 C420 80 440 120 440 200 V320 C440 400 420 440 380 440 H340 V80 H380 Z"
          fill="url(#hero-au-cup)"
          stroke="#fff"
          strokeWidth="10"
        />
        <path d="M160 220 H340" stroke="url(#hero-au-band)" strokeWidth="28" strokeLinecap="round" />
        <circle cx="250" cy="220" r="36" fill="#8b5cf6" stroke="#fff" strokeWidth="8" />
        <path d="M200 120 Q250 60 300 120" fill="none" stroke="#fff" strokeWidth="8" strokeOpacity="0.5" />
      </g>
    </SvgRoot>
  );
}

function LaptopsVisual({ className }: { className?: string }) {
  return (
    <SvgRoot className={className}>
      <defs>
        <linearGradient id="hero-lap-screen" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>
        <linearGradient id="hero-lap-base" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e6fffa" />
        </linearGradient>
      </defs>
      <circle cx="630" cy="140" r="115" fill="#ffffff" fillOpacity="0.12" />
      <circle cx="150" cy="660" r="155" fill="#ffffff" fillOpacity="0.08" />
      <g transform="translate(120 160)">
        <rect x="80" y="80" width="360" height="280" rx="20" fill="url(#hero-lap-screen)" stroke="#fff" strokeWidth="10" />
        <rect x="120" y="140" width="280" height="16" rx="8" fill="#99f6e4" fillOpacity="0.8" />
        <rect x="120" y="180" width="200" height="12" rx="6" fill="#99f6e4" fillOpacity="0.5" />
        <path d="M40 380 H480 L520 460 H0 Z" fill="url(#hero-lap-base)" stroke="#fff" strokeWidth="10" strokeLinejoin="round" />
        <text
          x="260"
          y="300"
          textAnchor="middle"
          fill="#fff"
          fontFamily="system-ui, sans-serif"
          fontSize="48"
          fontWeight="800"
        >
          NEW
        </text>
      </g>
    </SvgRoot>
  );
}

function DeliveryVisual({ className }: { className?: string }) {
  return (
    <SvgRoot className={className}>
      <defs>
        <linearGradient id="hero-del-box" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ffe8e4" />
        </linearGradient>
        <linearGradient id="hero-del-accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff7062" />
          <stop offset="100%" stopColor="#ff3d2e" />
        </linearGradient>
      </defs>
      <circle cx="620" cy="140" r="120" fill="#ffffff" fillOpacity="0.12" />
      <circle cx="160" cy="680" r="160" fill="#ffffff" fillOpacity="0.08" />
      <g transform="translate(140 180)">
        <rect x="80" y="120" width="360" height="280" rx="28" fill="url(#hero-del-box)" stroke="#ffffff" strokeWidth="8" />
        <path d="M80 200 H440" stroke="#ffd5ce" strokeWidth="6" />
        <rect x="120" y="260" width="120" height="16" rx="8" fill="#ffb8ad" />
        <rect x="120" y="300" width="200" height="16" rx="8" fill="#ffd5ce" />
        <path d="M500 260 L620 200 V420 H500 Z" fill="url(#hero-del-accent)" />
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
    </SvgRoot>
  );
}
