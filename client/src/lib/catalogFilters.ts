export type CatalogFiltersState = {
  categorySlugs: string[];
  minPrice: string;
  maxPrice: string;
  brands: string[];
  inStock: boolean;
  attrFilters: Record<string, string>;
};

const ATTR_PREFIX = 'attr_';

export function parseCatalogFiltersFromSearchParams(params: URLSearchParams): CatalogFiltersState {
  const categorySlugsParam = params.get('categorySlugs') ?? '';
  const legacySlug = params.get('categorySlug') ?? '';
  const categorySlugs = categorySlugsParam
    ? categorySlugsParam.split(',').map((s) => s.trim()).filter(Boolean)
    : legacySlug
      ? [legacySlug]
      : [];

  const brandsParam = params.get('brands') ?? '';
  const attrFilters: Record<string, string> = {};
  params.forEach((value, key) => {
    if (key.startsWith(ATTR_PREFIX) && value) {
      attrFilters[key.slice(ATTR_PREFIX.length)] = value;
    }
  });

  return {
    categorySlugs,
    minPrice: params.get('minPrice') ?? '',
    maxPrice: params.get('maxPrice') ?? '',
    brands: brandsParam.split(',').map((b) => b.trim()).filter(Boolean),
    inStock: params.get('inStock') === 'true',
    attrFilters,
  };
}

export function writeCatalogFiltersToSearchParams(
  base: URLSearchParams,
  filters: CatalogFiltersState,
  opts?: { sort?: string; page?: string },
): URLSearchParams {
  const next = new URLSearchParams(base);

  next.delete('categorySlug');
  next.delete('categorySlugs');
  if (filters.categorySlugs.length > 0) {
    next.set('categorySlugs', filters.categorySlugs.join(','));
  }

  if (filters.minPrice) next.set('minPrice', filters.minPrice);
  else next.delete('minPrice');
  if (filters.maxPrice) next.set('maxPrice', filters.maxPrice);
  else next.delete('maxPrice');

  if (filters.brands.length > 0) next.set('brands', filters.brands.join(','));
  else next.delete('brands');

  if (filters.inStock) next.set('inStock', 'true');
  else next.delete('inStock');

  for (const key of [...next.keys()]) {
    if (key.startsWith(ATTR_PREFIX)) next.delete(key);
  }
  for (const [slug, value] of Object.entries(filters.attrFilters)) {
    if (value) next.set(`${ATTR_PREFIX}${slug}`, value);
  }

  if (opts?.sort) next.set('sort', opts.sort);
  if (opts?.page) next.set('page', opts.page);
  else next.set('page', '1');

  return next;
}

function sortedStrings(a: string[]) {
  return [...a].sort().join('\0');
}

function sortedRecord(r: Record<string, string>) {
  return Object.keys(r)
    .sort()
    .map((k) => `${k}=${r[k]}`)
    .join('\0');
}

export function catalogFiltersEqual(a: CatalogFiltersState, b: CatalogFiltersState): boolean {
  return (
    sortedStrings(a.categorySlugs) === sortedStrings(b.categorySlugs) &&
    a.minPrice === b.minPrice &&
    a.maxPrice === b.maxPrice &&
    sortedStrings(a.brands) === sortedStrings(b.brands) &&
    a.inStock === b.inStock &&
    sortedRecord(a.attrFilters) === sortedRecord(b.attrFilters)
  );
}

export function buildProductsListQuery(
  filters: CatalogFiltersState,
  ctx: {
    page: number;
    sort: string;
    q: string;
    limit?: number;
  },
): Record<string, string | number | boolean | undefined> {
  const query: Record<string, string | number | boolean | undefined> = {
    page: ctx.page,
    limit: ctx.limit ?? 16,
    sort: ctx.sort,
    q: ctx.q || undefined,
    categorySlugs:
      filters.categorySlugs.length > 0 ? filters.categorySlugs.join(',') : undefined,
    minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
    brands: filters.brands.length > 0 ? filters.brands.join(',') : undefined,
    inStock: filters.inStock ? 'true' : undefined,
  };
  for (const [slug, value] of Object.entries(filters.attrFilters)) {
    query[`attr_${slug}`] = value;
  }
  return query;
}

const ELECTRONICS_SLUGS = new Set(['electronics', 'smartphones', 'laptops']);

export function shouldShowAttributeFilters(
  categorySlugs: string[],
  flatCategories: { id: string; slug: string; parentId: string | null }[],
): boolean {
  return categorySlugs.some((slug) => {
    if (ELECTRONICS_SLUGS.has(slug)) return true;
    const cat = flatCategories.find((c) => c.slug === slug);
    if (!cat?.parentId) return false;
    const parent = flatCategories.find((c) => c.id === cat.parentId);
    return parent ? ELECTRONICS_SLUGS.has(parent.slug) : false;
  });
}

export function hasAnyCatalogFilter(filters: CatalogFiltersState, q: string): boolean {
  return Boolean(
    filters.categorySlugs.length > 0 ||
      filters.minPrice ||
      filters.maxPrice ||
      q ||
      filters.inStock ||
      filters.brands.length > 0 ||
      Object.keys(filters.attrFilters).length > 0,
  );
}
