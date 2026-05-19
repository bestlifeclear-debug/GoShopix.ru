import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { categoriesApi, productsApi } from '../api/index';
import type { CategoryNode, ProductFacets, ProductListItem } from '../api/types';
import { ProductGrid } from '../components/ProductGrid';
import { Button, StatusBadge } from '../design-system';
import { IconCheck, IconClose, IconFilter } from '../design-system/icons/Icons';
import { snapshotFromDetail } from '../lib/cartSnapshot';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { PageContainer } from '../components/layout/PageContainer';
import styles from './CatalogPage.module.css';

const SORT_OPTIONS = [
  { value: 'popular', label: 'По популярности' },
  { value: 'price_asc', label: 'Сначала дешевле' },
  { value: 'rating_desc', label: 'По рейтингу' },
  { value: 'newest', label: 'По новизне' },
] as const;

const ATTR_PREFIX = 'attr_';

function getAttrFilters(params: URLSearchParams): Record<string, string> {
  const attrs: Record<string, string> = {};
  params.forEach((value, key) => {
    if (key.startsWith(ATTR_PREFIX) && value) {
      attrs[key.slice(ATTR_PREFIX.length)] = value;
    }
  });
  return attrs;
}

const ELECTRONICS_SLUGS = new Set(['electronics', 'smartphones', 'laptops']);

function FilterCheck({
  active,
  type,
  name,
  checked,
  onChange,
  children,
  className,
}: {
  active: boolean;
  type: 'checkbox' | 'radio';
  name?: string;
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`${styles.checkItem} ${active ? styles.checkItemActive : ''} ${className ?? ''}`}>
      <input
        type={type}
        name={name}
        className={styles.checkInputNative}
        checked={checked}
        onChange={onChange}
      />
      <span className={styles.checkMark} aria-hidden>
        {active ? <IconCheck width={16} height={16} /> : null}
      </span>
      <span className={styles.checkLabel}>{children}</span>
    </label>
  );
}

export function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [facets, setFacets] = useState<ProductFacets>({ brands: [], attributes: [] });
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
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
    document.body.style.overflow = filtersOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [filtersOpen]);

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

  const pageTitle = activeCategory?.name ?? (q ? `Поиск: ${q}` : 'Каталог');

  const sidebarContent = (
    <>
      <fieldset className={styles.filterGroup}>
        <legend className={styles.filterLabel}>Категория</legend>
        <ul className={styles.checkList}>
          <li>
            <FilterCheck
              active={!categorySlug}
              type="radio"
              name="category"
              checked={!categorySlug}
              onChange={() => setFilter('categorySlug', '')}
            >
              Все категории
            </FilterCheck>
          </li>
          {categoryRoots.map((root) => (
            <li key={root.id} className={styles.treeGroup}>
              <FilterCheck
                active={categorySlug === root.slug}
                type="radio"
                name="category"
                checked={categorySlug === root.slug}
                onChange={() => setFilter('categorySlug', root.slug)}
              >
                {root.name}
              </FilterCheck>
              {root.children.length > 0 && (
                <ul className={styles.treeChildren}>
                  {root.children.map((child) => (
                    <li key={child.id}>
                      <FilterCheck
                        active={categorySlug === child.slug}
                        type="radio"
                        name="category"
                        checked={categorySlug === child.slug}
                        onChange={() => setFilter('categorySlug', child.slug)}
                        className={styles.checkItemNested}
                      >
                        {child.name}
                      </FilterCheck>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset className={styles.filterGroup}>
        <legend className={styles.filterLabel}>Цена, ₽</legend>
        <div className={styles.priceRow}>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="от"
            value={minPrice}
            onChange={(e) => setFilter('minPrice', e.target.value)}
            className={styles.filterControl}
            aria-label="Цена от"
          />
          <span className={styles.priceDash} aria-hidden>
            —
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="до"
            value={maxPrice}
            onChange={(e) => setFilter('maxPrice', e.target.value)}
            className={styles.filterControl}
            aria-label="Цена до"
          />
        </div>
      </fieldset>

      {facets.brands.length > 0 && (
        <fieldset className={styles.filterGroup}>
          <legend className={styles.filterLabel}>Бренд</legend>
          <ul className={styles.checkList}>
            {facets.brands.map((brand) => (
              <li key={brand}>
                <FilterCheck
                  active={selectedBrands.includes(brand)}
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                >
                  {brand}
                </FilterCheck>
              </li>
            ))}
          </ul>
        </fieldset>
      )}

      <fieldset className={styles.filterGroup}>
        <legend className={styles.filterLabel}>Наличие</legend>
        <FilterCheck
          active={inStock}
          type="checkbox"
          checked={inStock}
          onChange={() => setFilter('inStock', inStock ? '' : 'true')}
        >
          В наличии
        </FilterCheck>
      </fieldset>

      {showAttributeFilters &&
        facets.attributes.map((attr) => (
          <fieldset key={attr.slug} className={styles.filterGroup}>
            <legend className={styles.filterLabel}>{attr.name}</legend>
            <ul className={styles.checkList}>
              {attr.values.map((value) => (
                <li key={value}>
                  <FilterCheck
                    active={attrFilters[attr.slug] === value}
                    type="radio"
                    name={`attr-${attr.slug}`}
                    checked={attrFilters[attr.slug] === value}
                    onChange={() => setAttrFilter(attr.slug, value)}
                  >
                    {value}
                  </FilterCheck>
                </li>
              ))}
              {attrFilters[attr.slug] && (
                <li>
                  <button
                    type="button"
                    className={styles.clearAttr}
                    onClick={() => setAttrFilter(attr.slug, '')}
                  >
                    Сбросить
                  </button>
                </li>
              )}
            </ul>
          </fieldset>
        ))}

      {q && <StatusBadge variant="neutral" label={`Поиск: ${q}`} />}
    </>
  );

  return (
    <PageContainer>
      <div className={styles.page}>
      <div className={styles.toolbar}>
        <h1 className={styles.title}>{pageTitle}</h1>
      </div>

      <div className={styles.mobileBar}>
        <button type="button" className={styles.mobileFilterBtn} onClick={() => setFiltersOpen(true)}>
          <IconFilter />
          Фильтры
          {hasActiveFilters && <span className={styles.filterDot} aria-hidden />}
        </button>
        <label className={styles.sortSelectWrap}>
          <span className={styles.sortSelectLabel}>Сортировка</span>
          <select
            className={styles.sortSelect}
            value={sort}
            onChange={(e) => setFilter('sort', e.target.value)}
            aria-label="Сортировка"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
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

      {filtersOpen && (
        <div className={styles.filterOverlay} role="presentation" onClick={() => setFiltersOpen(false)} />
      )}

      <div className={styles.layout}>
        <aside className={`${styles.sidebar} ${filtersOpen ? styles.sidebarOpen : ''}`} aria-label="Фильтры">
          <div className={styles.sheetHead}>
            <h2 className={styles.sidebarTitle}>Фильтры</h2>
            <button
              type="button"
              className={styles.sheetClose}
              onClick={() => setFiltersOpen(false)}
              aria-label="Закрыть фильтры"
            >
              <IconClose />
            </button>
          </div>
          {sidebarContent}
          <Button className={styles.sheetApply} onClick={() => setFiltersOpen(false)}>
            Показать товары
          </Button>
        </aside>

        <div className={styles.content}>
          <ProductGrid products={products} onAddToCart={handleAddSafe} loading={loading} />

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
