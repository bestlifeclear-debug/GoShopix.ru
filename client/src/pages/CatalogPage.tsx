import { useCallback, useEffect, useMemo, useState } from 'react';
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

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const query: Record<string, string | number | boolean | undefined> = {
        page,
        limit: 16,
        sort,
        q: q || undefined,
        categorySlug: categorySlug || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        brands: selectedBrands.length > 0 ? selectedBrands.join(',') : undefined,
        inStock: inStock ? 'true' : undefined,
      };
      for (const [slug, value] of Object.entries(attrFilters)) {
        query[`attr_${slug}`] = value;
      }
      const res = await productsApi.list(query);
      setProducts(res.items);
      setTotalPages(res.meta.totalPages);
      setTotalCount(res.meta.total);
    } finally {
      setLoading(false);
    }
  }, [page, sort, q, categorySlug, minPrice, maxPrice, selectedBrands, inStock, attrFilters]);

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
  const countLabel = productCountLabel(totalCount);

  const filterPanels = (
    <CatalogFilterPanels
      collapsible={!isDesktop}
      categorySlug={categorySlug}
      categoryRoots={categoryRoots}
      minPrice={minPrice}
      maxPrice={maxPrice}
      selectedBrands={selectedBrands}
      inStock={inStock}
      attrFilters={attrFilters}
      facets={facets}
      showAttributeFilters={Boolean(showAttributeFilters)}
      q={q}
      onCategoryChange={(slug) => setFilter('categorySlug', slug)}
      onMinPriceChange={(value) => setFilter('minPrice', value)}
      onMaxPriceChange={(value) => setFilter('maxPrice', value)}
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
        onReset={hasActiveFilters ? resetFilters : undefined}
        hasActiveFilters={hasActiveFilters}
        totalCount={totalCount}
        loading={loading}
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
