/** Превью категорий — те же пути, что в меню каталога */
export const CATEGORY_IMAGES: Record<string, string> = {
  electronics: '/product-images/gophone-x-1.svg',
  clothing: '/product-images/urban-wind-jacket-1.svg',
  smartphones: '/product-images/gophone-x-1.svg',
  laptops: '/product-images/probook-15-1.svg',
  audio: '/product-images/soundwave-pro-1.svg',
  shoes: '/product-images/street-run-sneakers-1.svg',
  accessories: '/product-images/city-pack-25-1.svg',
  sport: '/product-images/fittrack-2-1.svg',
  home: '/product-images/brewmaster-1.svg',
  appliances: '/product-images/brewmaster-1.svg',
};

export function categoryImageUrl(slug: string): string {
  return CATEGORY_IMAGES[slug] ?? '/product-images/soundwave-pro-1.svg';
}
