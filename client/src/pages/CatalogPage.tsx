import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { categoriesApi, productsApi } from '../api/index';
import type { CategoryNode, ProductFacets, ProductListItem } from '../api/types';
import { CatalogFilterPanels } from '../components/CatalogFilters/CatalogFilterPanels';
import { CatalogMobileFilters } from '../components/CatalogFilters/CatalogMobileFilters';
import { ProductGrid } from '../components/ProductGrid';
import { Button } from '../design-system';
import { IconClose, IconFilter } from '../design-system/icons/Icons';
import {
  buildProductsListQuery,
  hasAnyCatalogFilter,
  parseCatalogFiltersFromSearchParams,
  shouldShowAttributeFilters,
  writeCatalogFiltersToSearchParams,
  type CatalogFiltersState,
} from '../lib/catalogFilters';
import { snapshotFromDetail } from '../lib/cartSnapshot';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { PageContainer } from '../components/layout/PageContainer';
import styles from './CatalogPage.module.css';

const SORT_OPTIONS = [
  { value: 'popular', label: 'По популярности', short: 'Популярные' },
  { value: 'price_asc', label: 'Сначала дешевле', short: 'Дешевле' },
  { value: 'rating_desc', label: 'По рейтингу', short: 'Рейтинг' },
  { value: 'newest', label: 'По новизне', short: 'Новинки' },
] as const;

/** Задержка перед применением цены в URL — не фильтруем по «2», пока вводят «2000». */
const PRICE_APPLY_DEBOUNCE_MS = 400;

function productCountLabel(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return 'товар';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'товара';
  return 'товаров';
}

function useMinWidth(query: string) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    setMatches(mq.matches);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

export function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [facets, setFacets] = useState<ProductFacets>({ brands: [], attributes: [] });
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceInputMin, setPriceInputMin] = useState('');
  const [priceInputMax, setPriceInputMax] = useState('');
  const isDesktop = useMinWidth('(min-width: 768px)');
  const token = useAuthStore((s) => s.token);
  const addToCart = useCartStore((s) => s.addToCart);
  const openDrawer = useCartStore((s) => s.openDrawer);

  const page = Number(params.get('page') ?? 1);
  const sort = params.get('sort') ?? 'popular';
  const q = params.get('q') ?? '';

  const filters = useMemo(() => parseCatalogFiltersFromSearchParams(params), [params]);

  const categoryRoots = useMemo(() => categories.filter((c) => !c.parentId), [categories]);

  const flatCategories = useMemo(
    () => categories.flatMap((c) => [c, ...c.children, ...c.children.flatMap((ch) => ch.children)]),
    [categories],
  );

  const showAttributeFilters = shouldShowAttributeFilters(filters.categorySlugs, flatCategories);

  const applyFilters = useCallback(
    (next: CatalogFiltersState) => {
      setParams(writeCatalogFiltersToSearchParams(params, next, { sort }));
    },
    [params, sort, setParams],
  );

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productsApi.list(buildProductsListQuery(filters, { page, sort, q }));
      setProducts(res.items);
      setTotalPages(res.meta.totalPages);
      setTotalCount(res.meta.total);
    } finally {
      setLoading(false);
    }
  }, [filters, page, sort, q]);

  useEffect(() => {
    void categoriesApi.tree().then(setCategories);
  }, []);

  const categoryKey = filters.categorySlugs.join(',');
  useEffect(() => {
    void productsApi
      .facets(
        filters.categorySlugs.length > 0
          ? { categorySlugs: filters.categorySlugs.join(',') }
          : undefined,
      )
      .then(setFacets);
  }, [categoryKey]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (isDesktop && filtersOpen) setFiltersOpen(false);
  }, [isDesktop, filtersOpen]);

  useEffect(() => {
    setPriceInputMin(filters.minPrice);
    setPriceInputMax(filters.maxPrice);
  }, [filters.minPrice, filters.maxPrice]);

  useEffect(() => {
    if (priceInputMin === filters.minPrice && priceInputMax === filters.maxPrice) return;

    const timer = window.setTimeout(() => {
      setParams((prev) => {
        const current = parseCatalogFiltersFromSearchParams(prev);
        if (priceInputMin === current.minPrice && priceInputMax === current.maxPrice) {
          return prev;
        }
        return writeCatalogFiltersToSearchParams(
          prev,
          { ...current, minPrice: priceInputMin, maxPrice: priceInputMax },
          { sort },
        );
      });
    }, PRICE_APPLY_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [priceInputMin, priceInputMax, filters.minPrice, filters.maxPrice, sort, setParams]);

  const resetFilters = () => {
    const next = new URLSearchParams();
    if (sort) next.set('sort', sort);
    setParams(next);
  };

  const handleAddSafe = async (product: ProductListItem) => {
    try {
      const detail = await productsApi.get(product.id);
      const variant = detail.variants.find((v) => v.isDefault) ?? detail.variants[0];
      if (!variant) return;
      await addToCart(variant.id, 1, snapshotFromDetail(detail, variant));
      if (!token) openDrawer();
    } catch {
      /* ignore add errors in grid */
    }
  };

  const setSort = (value: string) => {
    const next = new URLSearchParams(params);
    next.set('sort', value);
    next.set('page', '1');
    setParams(next);
  };

  const setPage = (value: number) => {
    const next = new URLSearchParams(params);
    next.set('page', String(value));
    setParams(next);
  };

  const toggleCategory = (slug: string) => {
    const categorySlugs = filters.categorySlugs.includes(slug)
      ? filters.categorySlugs.filter((s) => s !== slug)
      : [...filters.categorySlugs, slug];
    applyFilters({ ...filters, categorySlugs });
  };

  const clearCategories = () => {
    applyFilters({ ...filters, categorySlugs: [] });
  };

  const toggleBrand = (brand: string) => {
    const brands = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    applyFilters({ ...filters, brands });
  };

  const setInStock = (checked: boolean) => {
    applyFilters({ ...filters, inStock: checked });
  };

  const setAttr = (slug: string, value: string) => {
    const attrFilters = { ...filters.attrFilters };
    if (value) attrFilters[slug] = value;
    else delete attrFilters[slug];
    applyFilters({ ...filters, attrFilters });
  };

  const removeCategory = (slug: string) => {
    applyFilters({
      ...filters,
      categorySlugs: filters.categorySlugs.filter((s) => s !== slug),
    });
  };

  const removeBrand = (brand: string) => {
    applyFilters({ ...filters, brands: filters.brands.filter((b) => b !== brand) });
  };

  const clearPrice = () => {
    setPriceInputMin('');
    setPriceInputMax('');
    applyFilters({ ...filters, minPrice: '', maxPrice: '' });
  };

  const clearInStock = () => {
    applyFilters({ ...filters, inStock: false });
  };

  const clearAttr = (slug: string) => {
    const attrFilters = { ...filters.attrFilters };
    delete attrFilters[slug];
    applyFilters({ ...filters, attrFilters });
  };

  const hasActiveFilters = hasAnyCatalogFilter(filters, q);
  const countLabel = productCountLabel(totalCount);
  const priceApplying =
    priceInputMin !== filters.minPrice || priceInputMax !== filters.maxPrice;

  const activeFilterChips = useMemo(() => {
    const chips: { id: string; label: string; onRemove: () => void }[] = [];
    for (const slug of filters.categorySlugs) {
      const label = flatCategories.find((c) => c.slug === slug)?.name ?? slug;
      chips.push({ id: `category-${slug}`, label, onRemove: () => removeCategory(slug) });
    }
    for (const brand of filters.brands) {
      chips.push({ id: `brand-${brand}`, label: brand, onRemove: () => removeBrand(brand) });
    }
    if (filters.minPrice || filters.maxPrice) {
      const priceLabel =
        filters.minPrice && filters.maxPrice
          ? `${filters.minPrice}–${filters.maxPrice} ₽`
          : filters.minPrice
            ? `от ${filters.minPrice} ₽`
            : `до ${filters.maxPrice} ₽`;
      chips.push({ id: 'price', label: `Цена: ${priceLabel}`, onRemove: clearPrice });
    }
    if (filters.inStock) {
      chips.push({ id: 'inStock', label: 'В наличии', onRemove: clearInStock });
    }
    for (const [slug, value] of Object.entries(filters.attrFilters)) {
      chips.push({ id: `attr-${slug}`, label: value, onRemove: () => clearAttr(slug) });
    }
    return chips;
  }, [filters, flatCategories]);

  const pageTitle = useMemo(() => {
    if (q) return `Поиск: ${q}`;
    if (filters.categorySlugs.length === 1) {
      return flatCategories.find((c) => c.slug === filters.categorySlugs[0])?.name ?? 'Каталог';
    }
    return 'Каталог';
  }, [q, filters.categorySlugs, flatCategories]);

  const filterPanels = (
    <CatalogFilterPanels
      collapsible={!isDesktop}
      selectedCategorySlugs={filters.categorySlugs}
      categoryRoots={categoryRoots}
      minPrice={priceInputMin}
      maxPrice={priceInputMax}
      selectedBrands={filters.brands}
      inStock={filters.inStock}
      attrFilters={filters.attrFilters}
      facets={facets}
      showAttributeFilters={showAttributeFilters}
      q={q}
      onToggleCategory={toggleCategory}
      onClearCategories={clearCategories}
      onMinPriceChange={setPriceInputMin}
      onMaxPriceChange={setPriceInputMax}
      onToggleBrand={toggleBrand}
      onInStockChange={setInStock}
      onAttrChange={setAttr}
    />
  );

  return (
    <PageContainer className={styles.pageWrap}>
      <div className={styles.page}>
        <div className={styles.toolbar}>
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>{pageTitle}</h1>
            {!loading && (
              <p className={styles.titleMeta}>
                {totalCount} {productCountLabel(totalCount)}
              </p>
            )}
          </div>
        </div>

        <div className={styles.mobileBar}>
          <button type="button" className={styles.mobileFilterBtn} onClick={() => setFiltersOpen(true)}>
            <IconFilter />
            <span>Фильтры</span>
            {activeFilterChips.length > 0 && (
              <span className={styles.filterBadge}>{activeFilterChips.length}</span>
            )}
          </button>
          <div className={styles.mobileSort} role="tablist" aria-label="Сортировка">
            {SORT_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                role="tab"
                aria-selected={sort === o.value}
                className={`${styles.mobileSortChip} ${sort === o.value ? styles.mobileSortChipActive : ''}`}
                onClick={() => setSort(o.value)}
              >
                {o.short}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.sortBar} role="group" aria-label="Сортировка товаров">
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              className={`${styles.sortChip} ${sort === o.value ? styles.sortChipActive : ''}`}
              onClick={() => setSort(o.value)}
            >
              {o.label}
            </button>
          ))}
          {hasActiveFilters && (
            <button type="button" className={styles.resetBtn} onClick={resetFilters}>
              Сбросить фильтры
            </button>
          )}
        </div>

        {activeFilterChips.length > 0 && (
          <div className={styles.activeFilters} role="list" aria-label="Активные фильтры">
            {activeFilterChips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                className={styles.filterChip}
                onClick={chip.onRemove}
                role="listitem"
              >
                <span>{chip.label}</span>
                <IconClose width={14} height={14} aria-hidden />
              </button>
            ))}
          </div>
        )}

        <CatalogMobileFilters
          open={!isDesktop && filtersOpen}
          onClose={() => setFiltersOpen(false)}
          onApply={() => setFiltersOpen(false)}
          onReset={hasActiveFilters ? resetFilters : undefined}
          hasActiveFilters={hasActiveFilters}
          totalCount={totalCount}
          loading={loading || priceApplying}
          resultsLabel={countLabel}
        >
          {filterPanels}
        </CatalogMobileFilters>

        <div className={styles.layout}>
          {isDesktop && (
            <aside className={`gsp-panel ${styles.sidebar}`} aria-label="Фильтры">
              <h2 className={styles.sidebarTitle}>Фильтры</h2>
              {filterPanels}
            </aside>
          )}

          <div className={styles.content}>
            {!loading && (
              <p className={styles.resultsCount}>
                Найдено {totalCount} {productCountLabel(totalCount)}
              </p>
            )}
            <ProductGrid
              products={products}
              onAddToCart={handleAddSafe}
              loading={loading}
              skeletonCount={16}
              variant="compact"
            />

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Назад
                </Button>
                <span>
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Вперёд
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
