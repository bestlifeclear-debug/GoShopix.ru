import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { categoriesApi, productsApi } from '../api/index';
import type { CategoryNode, ProductListItem } from '../api/types';
import { ProductGrid } from '../components/ProductGrid';
import { Button, StatusBadge } from '../design-system';
import { IconClose, IconFilter } from '../design-system/icons/Icons';
import { useCartStore } from '../stores/cartStore';
import { ApiClientError } from '../api/client';
import styles from './CatalogPage.module.css';

const SORT_OPTIONS = [
  { value: 'popular', label: 'Популярность' },
  { value: 'newest', label: 'Новинки' },
  { value: 'price_asc', label: 'Цена ↑' },
  { value: 'price_desc', label: 'Цена ↓' },
  { value: 'name_asc', label: 'По названию' },
] as const;

export function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const addToCart = useCartStore((s) => s.addToCart);

  const page = Number(params.get('page') ?? 1);
  const sort = params.get('sort') ?? 'popular';
  const q = params.get('q') ?? '';
  const categorySlug = params.get('categorySlug') ?? '';
  const minPrice = params.get('minPrice') ?? '';
  const maxPrice = params.get('maxPrice') ?? '';

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productsApi.list({
        page,
        limit: 16,
        sort,
        q: q || undefined,
        categorySlug: categorySlug || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      });
      setProducts(res.items);
      setTotalPages(res.meta.totalPages);
    } finally {
      setLoading(false);
    }
  }, [page, sort, q, categorySlug, minPrice, maxPrice]);

  useEffect(() => {
    void categoriesApi.tree().then(setCategories);
  }, []);

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

  const handleAdd = async (product: ProductListItem) => {
    try {
      const detail = await productsApi.get(product.id);
      const variant = detail.variants.find((v) => v.isDefault) ?? detail.variants[0];
      if (variant) await addToCart(variant.id);
    } catch (e) {
      if (e instanceof ApiClientError && e.status === 401) {
        window.location.href = '/account?tab=login';
      }
    }
  };

  const flatCategories = categories.flatMap((c) => [c, ...c.children]);
  const hasActiveFilters = Boolean(categorySlug || minPrice || maxPrice || q);

  const resetFilters = () => {
    const next = new URLSearchParams();
    if (sort) next.set('sort', sort);
    setParams(next);
  };

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <h1 className={styles.title}>Каталог</h1>
        <Button variant="outline" size="sm" className={styles.filterToggle} onClick={() => setFiltersOpen((o) => !o)}>
          {filtersOpen ? 'Скрыть' : 'Все фильтры'}
        </Button>
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

      <div className={styles.sortBar}>
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
            Сбросить
          </button>
        )}
      </div>

      {filtersOpen && (
        <div
          className={styles.filterOverlay}
          role="presentation"
          onClick={() => setFiltersOpen(false)}
        />
      )}

      <div className={styles.layout}>
        <aside className={`${styles.sidebar} ${filtersOpen ? styles.sidebarOpen : ''}`}>
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

          <fieldset className={styles.filterGroup}>
            <legend className={styles.filterLabel}>Категория</legend>
            <ul className={styles.checkList}>
              <li>
                <label className={styles.checkItem}>
                  <input
                    type="radio"
                    name="category"
                    checked={!categorySlug}
                    onChange={() => setFilter('categorySlug', '')}
                  />
                  <span>Все категории</span>
                </label>
              </li>
              {flatCategories.map((c) => (
                <li key={c.id}>
                  <label className={`${styles.checkItem} ${c.parentId ? styles.checkItemChild : ''}`}>
                    <input
                      type="radio"
                      name="category"
                      checked={categorySlug === c.slug}
                      onChange={() => setFilter('categorySlug', c.slug)}
                    />
                    <span>{c.name}</span>
                  </label>
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

          <label className={styles.filterGroup}>
            <span className={styles.filterLabel}>Сортировка</span>
            <select
              value={sort}
              onChange={(e) => setFilter('sort', e.target.value)}
              className={styles.filterControl}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          {q && <StatusBadge variant="neutral" label={`Поиск: ${q}`} />}

          <Button className={styles.sheetApply} onClick={() => setFiltersOpen(false)}>
            Показать товары
          </Button>
        </aside>

        <div className={styles.content}>
          <ProductGrid products={products} onAddToCart={handleAdd} loading={loading} />

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
  );
}
