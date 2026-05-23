import { useRef } from 'react';
import type { CategoryNode, ProductFacets } from '../../api/types';
import { StatusBadge } from '../../design-system';
import { IconCheck } from '../../design-system/icons/Icons';
import panelStyles from './catalogFilterPanels.module.css';

export function FilterSection({
  id,
  title,
  collapsible,
  defaultOpen = true,
  children,
}: {
  id: string;
  title: string;
  collapsible: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  if (collapsible) {
    return (
      <details className={panelStyles.filterSection} open={defaultOpen}>
        <summary className={panelStyles.filterSectionTitle}>{title}</summary>
        <div className={panelStyles.filterSectionBody}>{children}</div>
      </details>
    );
  }

  return (
    <fieldset className={panelStyles.filterGroup} aria-labelledby={id}>
      <div id={id} className={panelStyles.filterLegend}>
        {title}
      </div>
      {children}
    </fieldset>
  );
}

export function FilterCheck({
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
    <label
      className={`${panelStyles.checkItem} ${active ? panelStyles.checkItemActive : ''} ${className ?? ''}`}
    >
      <input
        type={type}
        name={name}
        className={panelStyles.checkInputNative}
        checked={checked}
        onChange={onChange}
      />
      <span className={panelStyles.checkMark} aria-hidden>
        {active ? <IconCheck width={14} height={14} /> : null}
      </span>
      <span className={panelStyles.checkLabel}>{children}</span>
    </label>
  );
}

const ELECTRONICS_SLUGS = new Set(['electronics', 'smartphones', 'laptops']);

export interface CatalogFilterPanelsProps {
  collapsible: boolean;
  categorySlug: string;
  categoryRoots: CategoryNode[];
  minPrice: string;
  maxPrice: string;
  selectedBrands: string[];
  inStock: boolean;
  attrFilters: Record<string, string>;
  facets: ProductFacets;
  showAttributeFilters: boolean;
  q: string;
  onCategoryChange: (slug: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onPriceBlur?: () => void;
  onToggleBrand: (brand: string) => void;
  onInStockChange: (checked: boolean) => void;
  onAttrChange: (slug: string, value: string) => void;
}

export function CatalogFilterPanels({
  collapsible,
  categorySlug,
  categoryRoots,
  minPrice,
  maxPrice,
  selectedBrands,
  inStock,
  attrFilters,
  facets,
  showAttributeFilters,
  q,
  onCategoryChange,
  onMinPriceChange,
  onMaxPriceChange,
  onPriceBlur,
  onToggleBrand,
  onInStockChange,
  onAttrChange,
}: CatalogFilterPanelsProps) {
  const priceRowRef = useRef<HTMLDivElement>(null);

  const handlePriceRowBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!onPriceBlur) return;
    const next = e.relatedTarget;
    if (next instanceof Node && priceRowRef.current?.contains(next)) return;
    onPriceBlur();
  };

  return (
    <>
      <FilterSection id="catalog-filter-category" title="Категория" collapsible={collapsible} defaultOpen>
        <ul className={panelStyles.checkList}>
          <li>
            <FilterCheck
              active={!categorySlug}
              type="radio"
              name="category"
              checked={!categorySlug}
              onChange={() => onCategoryChange('')}
            >
              Все категории
            </FilterCheck>
          </li>
          {categoryRoots.map((root) => (
            <li key={root.id} className={panelStyles.treeGroup}>
              <FilterCheck
                active={categorySlug === root.slug}
                type="radio"
                name="category"
                checked={categorySlug === root.slug}
                onChange={() => onCategoryChange(root.slug)}
              >
                {root.name}
              </FilterCheck>
              {root.children.length > 0 && (
                <ul className={panelStyles.treeChildren}>
                  {root.children.map((child) => (
                    <li key={child.id}>
                      <FilterCheck
                        active={categorySlug === child.slug}
                        type="radio"
                        name="category"
                        checked={categorySlug === child.slug}
                        onChange={() => onCategoryChange(child.slug)}
                        className={panelStyles.checkItemNested}
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
      </FilterSection>

      <FilterSection id="catalog-filter-price" title="Цена, ₽" collapsible={collapsible} defaultOpen>
        <div ref={priceRowRef} className={panelStyles.priceRow} onBlur={handlePriceRowBlur}>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="от"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            className={panelStyles.filterControl}
            aria-label="Цена от"
          />
          <span className={panelStyles.priceDash} aria-hidden>
            —
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="до"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            className={panelStyles.filterControl}
            aria-label="Цена до"
          />
        </div>
      </FilterSection>

      {facets.brands.length > 0 && (
        <FilterSection
          id="catalog-filter-brand"
          title="Бренд"
          collapsible={collapsible}
          defaultOpen={selectedBrands.length > 0}
        >
          <ul className={`${panelStyles.checkList} ${panelStyles.checkListGrid}`}>
            {facets.brands.map((brand) => (
              <li key={brand}>
                <FilterCheck
                  active={selectedBrands.includes(brand)}
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => onToggleBrand(brand)}
                >
                  {brand}
                </FilterCheck>
              </li>
            ))}
          </ul>
        </FilterSection>
      )}

      <FilterSection
        id="catalog-filter-stock"
        title="Наличие"
        collapsible={collapsible}
        defaultOpen={inStock}
      >
        <FilterCheck
          active={inStock}
          type="checkbox"
          checked={inStock}
          onChange={() => onInStockChange(!inStock)}
        >
          В наличии
        </FilterCheck>
      </FilterSection>

      {showAttributeFilters &&
        facets.attributes.map((attr) => (
          <FilterSection
            key={attr.slug}
            id={`catalog-filter-attr-${attr.slug}`}
            title={attr.name}
            collapsible={collapsible}
            defaultOpen={Boolean(attrFilters[attr.slug])}
          >
            <ul className={`${panelStyles.checkList} ${panelStyles.checkListGrid}`}>
              {attr.values.map((value) => (
                <li key={value}>
                  <FilterCheck
                    active={attrFilters[attr.slug] === value}
                    type="radio"
                    name={`attr-${attr.slug}`}
                    checked={attrFilters[attr.slug] === value}
                    onChange={() => onAttrChange(attr.slug, value)}
                  >
                    {value}
                  </FilterCheck>
                </li>
              ))}
              {attrFilters[attr.slug] && (
                <li className={panelStyles.clearAttrRow}>
                  <button
                    type="button"
                    className={panelStyles.clearAttr}
                    onClick={() => onAttrChange(attr.slug, '')}
                  >
                    Сбросить
                  </button>
                </li>
              )}
            </ul>
          </FilterSection>
        ))}

      {q && (
        <div className={panelStyles.searchBadge}>
          <StatusBadge variant="neutral" label={`Поиск: ${q}`} />
        </div>
      )}
    </>
  );
}

export { ELECTRONICS_SLUGS };
