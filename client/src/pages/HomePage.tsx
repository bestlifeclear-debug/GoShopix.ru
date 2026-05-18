import { useEffect, useState } from 'react';
import { categoriesApi, productsApi } from '../api/index';
import type { CategoryNode, ProductListItem } from '../api/types';
import { CategoryTabs } from '../components/CategoryTabs/CategoryTabs';
import { CategoryTiles } from '../components/CategoryTiles/CategoryTiles';
import { HeroCarousel } from '../components/HeroCarousel/HeroCarousel';
import { HomeProductSection } from '../components/HomeProductSection/HomeProductSection';
import { HomeQuickFilters } from '../components/HomeQuickFilters/HomeQuickFilters';
import { ProductRail } from '../components/ProductRail/ProductRail';
import { useCartStore } from '../stores/cartStore';
import { ApiClientError } from '../api/client';
import styles from './HomePage.module.css';

function pickTopRated(items: ProductListItem[], limit: number) {
  return [...items]
    .sort((a, b) => b.reviewCount - a.reviewCount || b.rating - a.rating)
    .slice(0, limit);
}

function pickDiscounted(items: ProductListItem[], limit: number) {
  const discounted = items.filter((p) => p.discountPercent != null && p.discountPercent > 0);
  return [...(discounted.length >= limit ? discounted : items)]
    .sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0))
    .slice(0, limit);
}

export function HomePage() {
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [hits, setHits] = useState<ProductListItem[]>([]);
  const [discounted, setDiscounted] = useState<ProductListItem[]>([]);
  const [newItems, setNewItems] = useState<ProductListItem[]>([]);
  const [catalogPreview, setCatalogPreview] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const addToCart = useCartStore((s) => s.addToCart);

  useEffect(() => {
    async function load() {
      try {
        const [cats, catalog, newest, popular] = await Promise.all([
          categoriesApi.tree(),
          productsApi.list({ page: 1, limit: 32 }),
          productsApi.list({ page: 1, limit: 12, sort: 'newest' }),
          productsApi.list({ page: 1, limit: 12, sort: 'popular' }),
        ]);
        const items = catalog.items;
        setCategories(cats);
        setCatalogPreview(items.slice(0, 12));
        setHits(popular.items.length > 0 ? popular.items : pickTopRated(items, 12));
        setDiscounted(pickDiscounted(items, 12));
        setNewItems(newest.items);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const handleAdd = async (product: ProductListItem) => {
    try {
      const detail = await productsApi.get(product.id);
      const variant = detail.variants.find((v) => v.isDefault) ?? detail.variants[0];
      if (!variant) return;
      await addToCart(variant.id);
    } catch (e) {
      if (e instanceof ApiClientError && e.status === 401) {
        window.location.href = '/account?tab=login';
      }
    }
  };

  return (
    <div className={styles.page}>
      <HeroCarousel />
      <div className={styles.mobileOnly}>
        <section className={styles.block}>
          <h2 className={styles.blockTitle}>Категории</h2>
          <CategoryTiles categories={categories} variant="mobile" />
        </section>

        <ProductRail
          title="Бестселлеры"
          hint="Хиты по отзывам"
          linkTo="/catalog?sort=popular"
          products={hits}
          onAddToCart={handleAdd}
          loading={loading}
        />
        <ProductRail
          title="Выгодные предложения"
          hint="Лучшие скидки"
          linkTo="/catalog?sort=price_asc"
          products={discounted}
          onAddToCart={handleAdd}
          loading={loading}
          highlightPrice
        />
        <ProductRail
          title="Новинки"
          hint="Свежие поступления"
          linkTo="/catalog?sort=newest"
          products={newItems}
          onAddToCart={handleAdd}
          loading={loading}
        />
        <ProductRail
          title="Рекомендуем"
          linkTo="/catalog"
          products={catalogPreview}
          onAddToCart={handleAdd}
          loading={loading}
        />
      </div>

      <div className={styles.desktopOnly}>
        <CategoryTabs
          categories={categories}
          hits={hits}
          discounted={discounted}
          newItems={newItems}
          loading={loading}
          onAddToCart={handleAdd}
        />
        <section className={styles.block}>
          <h2 className={styles.blockTitle}>Категории</h2>
          <CategoryTiles categories={categories} />
        </section>
        <HomeQuickFilters />
        <HomeProductSection
          title="Бестселлеры"
          hint="Топ товаров по отзывам покупателей"
          linkTo="/catalog?sort=popular"
          linkLabel="Все хиты →"
          products={hits}
          onAddToCart={handleAdd}
          loading={loading}
        />
        <HomeProductSection
          title="Выгодные предложения"
          hint="Максимальная экономия — акции обновляются ежедневно"
          linkTo="/catalog?sort=price_asc"
          linkLabel="Все акции →"
          products={discounted}
          onAddToCart={handleAdd}
          loading={loading}
        />
        <HomeProductSection
          title="Новинки"
          hint="Свежие поступления на маркетплейсе"
          linkTo="/catalog?sort=newest"
          linkLabel="Смотреть все →"
          products={newItems}
          onAddToCart={handleAdd}
          loading={loading}
        />
        <HomeProductSection
          title="Рекомендуем"
          hint="Популярные товары из каталога"
          linkTo="/catalog"
          linkLabel="Весь каталог →"
          products={catalogPreview}
          onAddToCart={handleAdd}
          loading={loading}
        />
      </div>
    </div>
  );
}
