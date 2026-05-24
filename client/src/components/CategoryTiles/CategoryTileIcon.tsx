import type { ComponentType, SVGProps } from 'react';
import styles from './CategoryTiles.module.css';

type IconProps = SVGProps<SVGSVGElement>;

function IconSmartphone(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <rect x="7" y="3" width="10" height="18" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="12" cy="17.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

function IconLaptop(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <rect x="5" y="5" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M3 17h18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconTshirt(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M9 4 7 7H4l2 3v10h12V10l2-3h-3l-2-3-3 2-3-2Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconHeadphones(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M4 14v-2a8 8 0 0116 0v2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <rect x="2" y="13" width="4" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <rect x="18" y="13" width="4" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function IconShoe(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M4 14c2-1 4-1 6 0 2 1 4 1 6 0l2-4H6l-2 4Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M6 10h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconBag(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M8 8V6a4 4 0 118 0v2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <rect x="5" y="8" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function IconDumbbell(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path d="M6 9v6M18 9v6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <rect x="3" y="10" width="3" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.75" />
      <rect x="18" y="10" width="3" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M9 12h6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconHome(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M4 11 12 4l8 7v8a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-8Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconAppliance(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.75" />
      <path d="M9 17h6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconElectronics(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <rect x="3" y="5" width="13" height="14" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M16 9h3l2 3v6h-5V9Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

const ICON_BY_SLUG: Record<string, ComponentType<IconProps>> = {
  electronics: IconElectronics,
  smartphones: IconSmartphone,
  laptops: IconLaptop,
  clothing: IconTshirt,
  audio: IconHeadphones,
  shoes: IconShoe,
  accessories: IconBag,
  sport: IconDumbbell,
  home: IconHome,
  appliances: IconAppliance,
};

const THEME_BY_SLUG: Record<string, string> = {
  electronics: styles.catElectronics,
  smartphones: styles.catSmartphones,
  laptops: styles.catLaptops,
  clothing: styles.catClothing,
  audio: styles.catAudio,
  shoes: styles.catShoes,
  accessories: styles.catAccessories,
  sport: styles.catSport,
  home: styles.catHome,
  appliances: styles.catAppliances,
};

interface CategoryTileIconProps {
  slug: string;
  className?: string;
}

export function CategoryTileIcon({ slug, className = '' }: CategoryTileIconProps) {
  const Icon = ICON_BY_SLUG[slug] ?? IconBag;

  return <Icon className={`${styles.categoryIcon} ${className}`.trim()} />;
}

export function categoryTileThemeClass(slug: string): string {
  return THEME_BY_SLUG[slug] ?? styles.catDefault;
}
