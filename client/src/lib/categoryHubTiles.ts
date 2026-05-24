/** Главные категории для мобильного хаба (visual-first сетка). */
export type CategoryHubTile = {
  slug: string;
  name: string;
};

export const CATEGORY_HUB_TILES: CategoryHubTile[] = [
  { slug: 'clothing', name: 'Одежда' },
  { slug: 'electronics', name: 'Электроника' },
  { slug: 'audio', name: 'Аудио' },
  { slug: 'home', name: 'Дом' },
  { slug: 'cosmetics', name: 'Косметика' },
  { slug: 'shoes', name: 'Обувь' },
];

export function catalogLinkForHubTile(slug: string): string {
  return `/catalog?categorySlug=${encodeURIComponent(slug)}`;
}
