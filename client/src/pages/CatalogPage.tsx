import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { categoriesApi, productsApi } from '../api/index';
import type { CategoryNode, ProductFacets, ProductListItem } from '../api/types';
import { CatalogFilterPanels, ELECTRONICS_SLUGS } from '../components/CatalogFilters/CatalogFilterPanels';
import { CatalogMobileFilters } from '../components/CatalogFilters/CatalogMobileFilters';
import { ProductGrid } from '../components/ProductGrid';
import { Button } from '../design-system';
import { IconClose, IconFilter } from '../design-system/icons/Icons';
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

const ATTR_PREFIX = 'attr_';
const PRICE_PREVIEW_DEBOUNCE_MS = 300;

function productCountLabel(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return 'товар';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'товара';
  return 'товаров';
}

function getAttrFilters(params: URLSearchParams): Record<string, string> {
  const attrs: Record<string, string> = {};
  params.forEach((value, key) => {
    if (key.startsWith(ATTR_PREFIX) && value) {
      attrs[key.slice(ATTR_PREFIX.length)] = value;
    }
  });
  return attrs;
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
  const [draftMinPrice, setDraftMinPrice] = useState('');
  const [draftMaxPrice, setDraftMaxPrice] = useState('');
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
  const categorySlug = params.get('categorySlug') ?? '';
  const minPrice = params.get('minPrice') ?? '';
  const maxPrice = params.get('maxPrice') ?? '';
  const brandsParam = params.get('brands') ?? '';
  const inStock = params.get('inStock') === 'true';
  const selectedBrands = useMemo(
    () => brandsParam.split(',').map((b) => b.trim()).filter(Boolean),
    [brandsParam],
  );
  const attrFilters = useMemo(() => getAttrFilters(params), [params]);

  const categoryRoots = useMemo(() => categories.filter((c) => !c.parentId), [categories]);

  const flatCategories = useMemo(
    () => categories.flatMap((c) => [c, ...c.children, ...c.children.flatMap((ch) => ch.children)]),
    [categories],
  );

  const activeCategory = flatCategories.find((c) => c.slug === categorySlug);
  const showAttributeFilters =
    ELECTRONICS_SLUGS.has(categorySlug) ||
    (activeCategory?.parentId &&
      flatCategories.some(
        (c) => c.id === activeCategory.parentId && ELECTRONICS_SLUGS.has(c.slug),
      ));

  const buildListQuery = useCallback(
    (
      priceMin: string,
      priceMax: string,
      opts: { page?: number; limit?: number } = {},
    ): Record<string, string | number | boolean | undefined> => {
      const query: Record<string, string | number | boolean | undefined> = {
        page: opts.page ?? page,
        limit: opts.limit ?? 16,
        sort,
        q: q || undefined,
        categorySlug: categorySlug || undefined,
        minPrice: priceMin ? Number(priceMin) : undefined,
        maxPrice: priceMax ? Number(priceMax) : undefined,
        brands: selectedBrands.length > 0 ? selectedBrands.join(',') : undefined,
        inStock: inStock ? 'true' : undefined,
      };
      for (const [slug, value] of Object.entries(attrFilters)) {
        query[`attr_${slug}`] = value;
      }
      return query;
    },
    [page, sort, q, categorySlug, selectedBrands, inStock, attrFilters],
  );

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productsApi.list(buildListQuery(minPrice, maxPrice));
      setProducts(res.items);
      setTotalPages(res.meta.totalPages);
      setTotalCount(res.meta.total);
    } finally {
      setLoading(false);
    }
  }, [buildListQuery, minPrice, maxPrice]);

  useEffect(() => {
    void categoriesApi.tree().then(setCategories);
  }, []);

  useEffect(() => {
    void productsApi.facets(categorySlug ? { categorySlug } : undefined).then(setFacets);
  }, [categorySlug]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (isDesktop && filtersOpen) setFiltersOpen(false);
  }, [isDesktop, filtersOpen]);

  useEffect(() => {
    setDraftMinPrice(minPrice);
    setDraftMaxPrice(maxPrice);
  }, [minPrice, maxPrice]);

  const pricePending =
    draftMinPrice !== minPrice || draftMaxPrice !== maxPrice;

  useEffect(() => {
    if (!pricePending) {
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
            buildListQuery(draftMinPrice, draftMaxPrice, { page: 1, limit: 1 }),
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
    }, PRICE_PREVIEW_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [
    pricePending,
    draftMinPrice,
    draftMaxPrice,
    buildListQuery,
    totalCount,
  ]);

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setParams(next);
  };

  const toggleBrand = (brand: string) => {
    const next = new URLSearchParams(params);
    const list = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];
    if (list.length > 0) next.set('brands', list.join(','));
    else next.delete('brands');
    next.set('page', '1');
    setParams(next);
  };

  const setAttrFilter = (slug: string, value: string) => {
    const next = new URLSearchParams(params);
    const key = `${ATTR_PREFIX}${slug}`;
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
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

  const hasActiveFilters = Boolean(
    categorySlug || minPrice || maxPrice || q || inStock || selectedBrands.length > 0 || Object.keys(attrFilters).length > 0,
  );

  const resetFilters = () => {
    const next = new URLSearchParams();
    if (sort) next.set('sort', sort);
    setParams(next);
  };

  const clearPriceFilter = () => {
    const next = new URLSearchParams(params);
    next.delete('minPrice');
    next.delete('maxPrice');
    next.set('page', '1');
    setParams(next);
  };

  const setPriceRange = (min: string, max: string) => {
    const next = new URLSearchParams(params);
    if (min) next.set('minPrice', min);
    else next.delete('minPrice');
    if (max) next.set('maxPrice', max);
    else next.delete('maxPrice');
    next.set('page', '1');
    setParams(next);
  };

  const commitDraftPrice = useCallback(() => {
    if (draftMinPrice === minPrice && draftMaxPrice === maxPrice) return;
    setPriceRange(draftMinPrice, draftMaxPrice);
  }, [draftMinPrice, draftMaxPrice, minPrice, maxPrice]);

  const applyMobileFilters = () => {
    setPriceRange(draftMinPrice, draftMaxPrice);
    setFiltersOpen(false);
  };

  const activeFilterChips = useMemo(() => {
    const chips: { id: string; label: string; onRemove: () => void }[] = [];
    if (categorySlug) {
      const label = activeCategory?.name ?? categorySlug;
      chips.push({
        id: 'category',
        label,
        onRemove: () => setFilter('categorySlug', ''),
      });
    }
    for (const brand of selectedBrands) {
      chips.push({
        id: `brand-${brand}`,
        label: brand,
        onRemove: () => toggleBrand(brand),
      });
    }
    if (minPrice || maxPrice) {
      const priceLabel =
        minPrice && maxPrice
          ? `${minPrice}–${maxPrice} ₽`
          : minPrice
            ? `от ${minPrice} ₽`
            : `до ${maxPrice} ₽`;
      chips.push({ id: 'price', label: `Цена: ${priceLabel}`, onRemove: clearPriceFilter });
    }
    if (inStock) {
      chips.push({ id: 'inStock', label: 'В наличии', onRemove: () => setFilter('inStock', '') });
    }
    return chips;
  }, [
    categorySlug,
    activeCategory?.name,
    selectedBrands,
    minPrice,
    maxPrice,
    inStock,
    params,
  ]);

  const pageTitle = activeCategory?.name ?? (q ? `Поиск: ${q}` : 'Каталог');
  const displayCount = pricePending ? previewCount : totalCount;
  const displayCountLoading = pricePending ? previewLoading : loading;
  const countLabel = productCountLabel(displayCount);

  const renderFilterPanels = (onPriceBlur?: () => void) => (
    <CatalogFilterPanels
      collapsible={!isDesktop}
      categorySlug={categorySlug}
      categoryRoots={categoryRoots}
      minPrice={draftMinPrice}
      maxPrice={draftMaxPrice}
      selectedBrands={selectedBrands}
      inStock={inStock}
      attrFilters={attrFilters}
      facets={facets}
      showAttributeFilters={Boolean(showAttributeFilters)}
      q={q}
      onCategoryChange={(slug) => setFilter('categorySlug', slug)}
      onMinPriceChange={setDraftMinPrice}
      onMaxPriceChange={setDraftMaxPrice}
      onPriceBlur={onPriceBlur}
      onToggleBrand={toggleBrand}
      onInStockChange={(checked) => setFilter('inStock', checked ? 'true' : '')}
      onAttrChange={setAttrFilter}
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
              onClick={() => setFilter('sort', o.value)}
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
            onClick={() => setFilter('sort', o.value)}
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
        onApply={applyMobileFilters}
        onReset={hasActiveFilters ? resetFilters : undefined}
        hasActiveFilters={hasActiveFilters}
        totalCount={displayCount}
        loading={displayCountLoading}
        resultsLabel={countLabel}
      >
        {renderFilterPanels()}
      </CatalogMobileFilters>

      <div className={styles.layout}>
        {isDesktop && (
          <aside className={`gsp-panel ${styles.sidebar}`} aria-label="Фильтры">
            <h2 className={styles.sidebarTitle}>Фильтры</h2>
            {renderFilterPanels(commitDraftPrice)}
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
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setFilter('page', String(page - 1))}
              >
                Назад
              </Button>
              <span>
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setFilter('page', String(page + 1))}
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
