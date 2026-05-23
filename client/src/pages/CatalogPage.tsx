import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  catalogFiltersEqual,
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

const FILTER_PREVIEW_DEBOUNCE_MS = 300;

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
  const [previewCount, setPreviewCount] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewRequestRef = useRef(0);
  const isDesktop = useMinWidth('(min-width: 768px)');
  const token = useAuthStore((s) => s.token);
  const addToCart = useCartStore((s) => s.addToCart);
  const openDrawer = useCartStore((s) => s.openDrawer);

  const page = Number(params.get('page') ?? 1);
  const sort = params.get('sort') ?? 'popular';
  const q = params.get('q') ?? '';

  const appliedFilters = useMemo(() => parseCatalogFiltersFromSearchParams(params), [params]);

  const [draftFilters, setDraftFilters] = useState<CatalogFiltersState>(appliedFilters);

  const categoryRoots = useMemo(() => categories.filter((c) => !c.parentId), [categories]);

  const flatCategories = useMemo(
    () => categories.flatMap((c) => [c, ...c.children, ...c.children.flatMap((ch) => ch.children)]),
    [categories],
  );

  const filtersPending = !catalogFiltersEqual(draftFilters, appliedFilters);

  const showAttributeFilters = shouldShowAttributeFilters(
    draftFilters.categorySlugs,
    flatCategories,
  );

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productsApi.list(
        buildProductsListQuery(appliedFilters, { page, sort, q }),
      );
      setProducts(res.items);
      setTotalPages(res.meta.totalPages);
      setTotalCount(res.meta.total);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, page, sort, q]);

  useEffect(() => {
    void categoriesApi.tree().then(setCategories);
  }, []);

  const draftCategoryKey = draftFilters.categorySlugs.join(',');
  useEffect(() => {
    void productsApi
      .facets(
        draftFilters.categorySlugs.length > 0
          ? { categorySlugs: draftFilters.categorySlugs.join(',') }
          : undefined,
      )
      .then(setFacets);
  }, [draftCategoryKey]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (isDesktop && filtersOpen) setFiltersOpen(false);
  }, [isDesktop, filtersOpen]);

  useEffect(() => {
    if (!filtersPending) {
      setDraftFilters(appliedFilters);
    }
  }, [appliedFilters, filtersPending]);

  useEffect(() => {
    if (filtersOpen && !isDesktop) {
      setDraftFilters(appliedFilters);
    }
  }, [filtersOpen, isDesktop, appliedFilters]);

  useEffect(() => {
    if (!filtersPending) {
      setPreviewCount(totalCount);
      setPreviewLoading(false);
      return;
    }

    const requestId = ++previewRequestRef.current;
    const timer = window.setTimeout(() => {
      void (async () => {
        setPreviewLoading(true);
        try {
          const res = await productsApi.list(
            buildProductsListQuery(draftFilters, { page: 1, sort, q, limit: 1 }),
          );
          if (previewRequestRef.current === requestId) {
            setPreviewCount(res.meta.total);
          }
        } finally {
          if (previewRequestRef.current === requestId) {
            setPreviewLoading(false);
          }
        }
      })();
    }, FILTER_PREVIEW_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [filtersPending, draftFilters, sort, q, totalCount]);

  const commitDraftFilters = useCallback(() => {
    if (!filtersPending) return;
    const next = writeCatalogFiltersToSearchParams(params, draftFilters, { sort });
    setParams(next);
  }, [filtersPending, params, draftFilters, sort, setParams]);

  const resetFilters = () => {
    const next = new URLSearchParams();
    if (sort) next.set('sort', sort);
    setParams(next);
    setDraftFilters(parseCatalogFiltersFromSearchParams(next));
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

  const removeAppliedCategory = (slug: string) => {
    const nextFilters: CatalogFiltersState = {
      ...appliedFilters,
      categorySlugs: appliedFilters.categorySlugs.filter((s) => s !== slug),
    };
    setParams(writeCatalogFiltersToSearchParams(params, nextFilters, { sort }));
  };

  const removeAppliedBrand = (brand: string) => {
    const nextFilters: CatalogFiltersState = {
      ...appliedFilters,
      brands: appliedFilters.brands.filter((b) => b !== brand),
    };
    setParams(writeCatalogFiltersToSearchParams(params, nextFilters, { sort }));
  };

  const clearAppliedPrice = () => {
    const nextFilters: CatalogFiltersState = {
      ...appliedFilters,
      minPrice: '',
      maxPrice: '',
    };
    setParams(writeCatalogFiltersToSearchParams(params, nextFilters, { sort }));
  };

  const clearAppliedInStock = () => {
    const nextFilters: CatalogFiltersState = { ...appliedFilters, inStock: false };
    setParams(writeCatalogFiltersToSearchParams(params, nextFilters, { sort }));
  };

  const clearAppliedAttr = (slug: string) => {
    const nextAttr = { ...appliedFilters.attrFilters };
    delete nextAttr[slug];
    const nextFilters: CatalogFiltersState = { ...appliedFilters, attrFilters: nextAttr };
    setParams(writeCatalogFiltersToSearchParams(params, nextFilters, { sort }));
  };

  const applyMobileFilters = () => {
    commitDraftFilters();
    setFiltersOpen(false);
  };

  const closeMobileFilters = () => {
    setDraftFilters(appliedFilters);
    setFiltersOpen(false);
  };

  const hasActiveFilters = hasAnyCatalogFilter(appliedFilters, q);

  const activeFilterChips = useMemo(() => {
    const chips: { id: string; label: string; onRemove: () => void }[] = [];
    for (const slug of appliedFilters.categorySlugs) {
      const label = flatCategories.find((c) => c.slug === slug)?.name ?? slug;
      chips.push({
        id: `category-${slug}`,
        label,
        onRemove: () => removeAppliedCategory(slug),
      });
    }
    for (const brand of appliedFilters.brands) {
      chips.push({
        id: `brand-${brand}`,
        label: brand,
        onRemove: () => removeAppliedBrand(brand),
      });
    }
    if (appliedFilters.minPrice || appliedFilters.maxPrice) {
      const priceLabel =
        appliedFilters.minPrice && appliedFilters.maxPrice
          ? `${appliedFilters.minPrice}–${appliedFilters.maxPrice} ₽`
          : appliedFilters.minPrice
            ? `от ${appliedFilters.minPrice} ₽`
            : `до ${appliedFilters.maxPrice} ₽`;
      chips.push({ id: 'price', label: `Цена: ${priceLabel}`, onRemove: clearAppliedPrice });
    }
    if (appliedFilters.inStock) {
      chips.push({ id: 'inStock', label: 'В наличии', onRemove: clearAppliedInStock });
    }
    for (const [slug, value] of Object.entries(appliedFilters.attrFilters)) {
      chips.push({
        id: `attr-${slug}`,
        label: value,
        onRemove: () => clearAppliedAttr(slug),
      });
    }
    return chips;
  }, [appliedFilters, flatCategories]);

  const pageTitle = useMemo(() => {
    if (q) return `Поиск: ${q}`;
    if (appliedFilters.categorySlugs.length === 1) {
      return flatCategories.find((c) => c.slug === appliedFilters.categorySlugs[0])?.name ?? 'Каталог';
    }
    return 'Каталог';
  }, [q, appliedFilters.categorySlugs, flatCategories]);

  const displayCount = filtersPending ? previewCount : totalCount;
  const displayCountLoading = filtersPending ? previewLoading : loading;
  const countLabel = productCountLabel(displayCount);

  const updateDraft = (patch: Partial<CatalogFiltersState>) => {
    setDraftFilters((prev) => ({ ...prev, ...patch }));
  };

  const toggleDraftCategory = (slug: string) => {
    setDraftFilters((prev) => ({
      ...prev,
      categorySlugs: prev.categorySlugs.includes(slug)
        ? prev.categorySlugs.filter((s) => s !== slug)
        : [...prev.categorySlugs, slug],
    }));
  };

  const toggleDraftBrand = (brand: string) => {
    setDraftFilters((prev) => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter((b) => b !== brand)
        : [...prev.brands, brand],
    }));
  };

  const setDraftAttr = (slug: string, value: string) => {
    setDraftFilters((prev) => {
      const nextAttr = { ...prev.attrFilters };
      if (value) nextAttr[slug] = value;
      else delete nextAttr[slug];
      return { ...prev, attrFilters: nextAttr };
    });
  };

  const filterPanels = (
    <CatalogFilterPanels
      collapsible={!isDesktop}
      selectedCategorySlugs={draftFilters.categorySlugs}
      categoryRoots={categoryRoots}
      minPrice={draftFilters.minPrice}
      maxPrice={draftFilters.maxPrice}
      selectedBrands={draftFilters.brands}
      inStock={draftFilters.inStock}
      attrFilters={draftFilters.attrFilters}
      facets={facets}
      showAttributeFilters={showAttributeFilters}
      q={q}
      onToggleCategory={toggleDraftCategory}
      onClearCategories={() => updateDraft({ categorySlugs: [] })}
      onMinPriceChange={(value) => updateDraft({ minPrice: value })}
      onMaxPriceChange={(value) => updateDraft({ maxPrice: value })}
      onToggleBrand={toggleDraftBrand}
      onInStockChange={(checked) => updateDraft({ inStock: checked })}
      onAttrChange={setDraftAttr}
    />
  );

  return (
    <PageContainer className={styles.pageWrap}>
      <div className={styles.page}>
        <div className={styles.toolbar}>
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>{pageTitle}</h1>
            {!displayCountLoading && (
              <p className={styles.titleMeta}>
                {displayCount} {productCountLabel(displayCount)}
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
          onClose={closeMobileFilters}
          onApply={applyMobileFilters}
          onReset={hasActiveFilters ? resetFilters : undefined}
          hasActiveFilters={hasActiveFilters}
          totalCount={displayCount}
          loading={displayCountLoading}
          resultsLabel={countLabel}
        >
          {filterPanels}
        </CatalogMobileFilters>

        <div className={styles.layout}>
          {isDesktop && (
            <aside className={`gsp-panel ${styles.sidebar}`} aria-label="Фильтры">
              <h2 className={styles.sidebarTitle}>Фильтры</h2>
              <div className={styles.sidebarFilters}>{filterPanels}</div>
              <div className={styles.sidebarFooter}>
                <Button
                  type="button"
                  className={styles.sidebarApplyBtn}
                  onClick={commitDraftFilters}
                  disabled={!filtersPending}
                >
                  {displayCountLoading
                    ? 'Загрузка…'
                    : `Показать ${displayCount} ${countLabel}`}
                </Button>
              </div>
            </aside>
          )}

          <div className={styles.content}>
            {!displayCountLoading && (
              <p className={styles.resultsCount}>
                Найдено {displayCount} {productCountLabel(displayCount)}
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
