const THEME_KEYS: Record<string, string> = {
  electronics: 'catElectronics',
  clothing: 'catClothing',
  audio: 'catAudio',
  shoes: 'catShoes',
  accessories: 'catAccessories',
  sport: 'catSport',
  home: 'catHome',
  appliances: 'catAppliances',
  cosmetics: 'catCosmetics',
};

export function categoryHubThemeClass(
  slug: string,
  styles: Record<string, string>,
): string {
  const key = THEME_KEYS[slug] ?? 'catDefault';
  return styles[key] ?? '';
}
