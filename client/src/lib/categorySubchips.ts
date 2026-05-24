export type SubcategoryChip = {
  id: string;
  label: string;
  categorySlug: string;
  /** UX-секция внутри корневой категории (не влияет на API, только активное состояние чипа). */
  section?: string;
};

export const SUBCATEGORY_CHIPS_BY_ROOT: Record<string, SubcategoryChip[]> = {
  clothing: [
    { id: 'all', label: 'Все', categorySlug: 'clothing' },
    { id: 'women', label: 'Женская', categorySlug: 'clothing', section: 'women' },
    { id: 'men', label: 'Мужская', categorySlug: 'clothing', section: 'men' },
    { id: 'kids', label: 'Детская', categorySlug: 'clothing', section: 'kids' },
    { id: 'shoes', label: 'Обувь', categorySlug: 'shoes' },
    { id: 'accessories', label: 'Аксессуары', categorySlug: 'accessories' },
  ],
  electronics: [
    { id: 'all', label: 'Все', categorySlug: 'electronics' },
    { id: 'phones', label: 'Смартфоны', categorySlug: 'smartphones' },
    { id: 'laptops', label: 'Ноутбуки', categorySlug: 'laptops' },
    { id: 'audio', label: 'Аудио', categorySlug: 'audio' },
    { id: 'accessories', label: 'Аксессуары', categorySlug: 'accessories' },
  ],
  audio: [
    { id: 'all', label: 'Все', categorySlug: 'audio' },
    { id: 'headphones', label: 'Наушники', categorySlug: 'audio', section: 'headphones' },
    { id: 'speakers', label: 'Колонки', categorySlug: 'audio', section: 'speakers' },
    { id: 'portable', label: 'Портативные', categorySlug: 'audio', section: 'portable' },
  ],
  home: [
    { id: 'all', label: 'Все', categorySlug: 'home' },
    { id: 'kitchen', label: 'Кухня', categorySlug: 'home', section: 'kitchen' },
    { id: 'textile', label: 'Текстиль', categorySlug: 'home', section: 'textile' },
    { id: 'decor', label: 'Декор', categorySlug: 'home', section: 'decor' },
    { id: 'appliances', label: 'Техника', categorySlug: 'appliances' },
  ],
  shoes: [
    { id: 'all', label: 'Все', categorySlug: 'shoes' },
    { id: 'sneakers', label: 'Кроссовки', categorySlug: 'shoes', section: 'sneakers' },
    { id: 'boots', label: 'Ботинки', categorySlug: 'shoes', section: 'boots' },
    { id: 'sport', label: 'Спорт', categorySlug: 'sport' },
  ],
  cosmetics: [
    { id: 'all', label: 'Все', categorySlug: 'cosmetics' },
    { id: 'face', label: 'Лицо', categorySlug: 'cosmetics', section: 'face' },
    { id: 'hair', label: 'Волосы', categorySlug: 'cosmetics', section: 'hair' },
    { id: 'body', label: 'Тело', categorySlug: 'cosmetics', section: 'body' },
  ],
};

export function getSubchipsForRoot(rootSlug: string | null): SubcategoryChip[] {
  if (!rootSlug) return [];
  return SUBCATEGORY_CHIPS_BY_ROOT[rootSlug] ?? [];
}

export function resolveRootCategorySlug(
  categorySlugs: string[],
  flatCategories: { id: string; slug: string; parentId: string | null }[],
): string | null {
  if (categorySlugs.length !== 1) return null;

  const slug = categorySlugs[0];
  if (SUBCATEGORY_CHIPS_BY_ROOT[slug]) return slug;

  let cat = flatCategories.find((c) => c.slug === slug);
  if (!cat) return null;

  while (cat.parentId) {
    const parent = flatCategories.find((c) => c.id === cat!.parentId);
    if (!parent) break;
    cat = parent;
  }

  return SUBCATEGORY_CHIPS_BY_ROOT[cat.slug] ? cat.slug : null;
}

export function isSubchipActive(
  chip: SubcategoryChip,
  categorySlugs: string[],
  section: string,
): boolean {
  if (categorySlugs.length !== 1 || categorySlugs[0] !== chip.categorySlug) return false;
  const chipSection = chip.section ?? '';
  return chipSection === section;
}
