import { useState } from 'react';
import type { CategoryNode, ProductListItem } from '../../api/types';
import { CategoryTiles } from '../CategoryTiles/CategoryTiles';
import { HomeProductSection } from '../HomeProductSection/HomeProductSection';
import styles from './CategoryTabs.module.css';

type TabId = 'all' | 'hits' | 'sale' | 'new';

interface CategoryTabsProps {
  categories: CategoryNode[];
  hits: ProductListItem[];
  discounted: ProductListItem[];
  newItems: ProductListItem[];
  loading?: boolean;
  onAddToCart?: (product: ProductListItem) => void;
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'hits', label: 'Хиты' },
  { id: 'sale', label: 'Скидки' },
  { id: 'new', label: 'Новинки' },
  { id: 'all', label: 'Категории' },
];

export function CategoryTabs({
  categories,
  hits,
  discounted,
  newItems,
  loading,
  onAddToCart,
}: CategoryTabsProps) {
  const [active, setActive] = useState<TabId>('hits');

  return (
    <section className={styles.section} aria-label="Секции каталога">
      <div className={styles.tabs} role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            className={`${styles.tab} ${active === tab.id ? styles.tabActive : ''}`}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.panel} role="tabpanel">
        <div className={styles.mobileCategories}>
          <CategoryTiles categories={categories} />
        </div>

        <div className={styles.desktopTabPanels}>
          {active === 'all' && <CategoryTiles categories={categories} />}
          {active === 'hits' && (
            <HomeProductSection
              title="Хиты продаж"
              linkTo="/catalog?sort=popular"
              linkLabel="Все →"
              products={hits}
              onAddToCart={onAddToCart}
              loading={loading}
            />
          )}
          {active === 'sale' && (
            <HomeProductSection
              title="Выгодные скидки"
              linkTo="/catalog?sort=price_asc"
              linkLabel="Все →"
              products={discounted}
              onAddToCart={onAddToCart}
              loading={loading}
            />
          )}
          {active === 'new' && (
            <HomeProductSection
              title="Новинки"
              linkTo="/catalog?sort=newest"
              linkLabel="Все →"
              products={newItems}
              onAddToCart={onAddToCart}
              loading={loading}
            />
          )}
        </div>
      </div>
    </section>
  );
}
