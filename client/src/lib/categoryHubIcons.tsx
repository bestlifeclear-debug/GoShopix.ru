import type { LucideIcon } from 'lucide-react';
import {
  Footprints,
  Headphones,
  House,
  Shirt,
  Smartphone,
  Sparkles,
} from 'lucide-react';

const ICON_BY_SLUG: Record<string, LucideIcon> = {
  clothing: Shirt,
  electronics: Smartphone,
  audio: Headphones,
  home: House,
  cosmetics: Sparkles,
  shoes: Footprints,
};

export function CategoryHubIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = ICON_BY_SLUG[slug] ?? Sparkles;
  return <Icon className={className} strokeWidth={1.75} aria-hidden />;
}
