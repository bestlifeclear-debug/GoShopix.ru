import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, MoreHorizontal, Package, Plus, Search } from 'lucide-react';
import { formatPrice } from '@goshopix/shared';
import { exportCsv } from '../components/exportCsv';
import {
  MOCK_PRODUCTS,
  PRODUCT_CATEGORY_OPTIONS,
  type MockSellerProduct,
  type ProductListStatus,
} from './products/mockData';
import styles from './ProductsPage.module.css';

function statusClass(status: ProductListStatus) {
  const map = {
    active: styles.statusActive,
    moderation: styles.statusModeration,
    draft: styles.statusDraft,
  } as const;
  return map[status];
}

function stockClass(stock: number) {
  if (stock === 0) return styles.stockMuted;
  if (stock < 3) return styles.stockLow;
  return styles.stockOk;
}

function formatStock(stock: number) {
  return `${stock} шт.`;
}

function handleExport(products: MockSellerProduct[]) {
  exportCsv(
    'products.csv',
    ['Товар', 'Артикул', 'Категория', 'Цена', 'Остаток', 'Статус'],
    products.map((p) => [
      p.name,
      p.sku,
      p.category,
      p.price,
      p.stock,
      p.statusLabel,
    ]),
  );
}

export function ProductsPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return MOCK_PRODUCTS.filter((p) => {
      if (category && p.category !== category) return false;
      if (!query) return true;
      return (
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    });
  }, [q, category]);

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Товары</h1>
        <p className={styles.pageSubtitle}>Управление ассортиментом и остатками магазина</p>
      </header>

      <div className={styles.toolbarCard}>
        <div className={styles.toolbarLeft}>
          <div className={styles.searchWrap}>
            <Search className={styles.searchIcon} size={18} strokeWidth={2} aria-hidden />
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Поиск по названию или артикулу…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Поиск товаров"
            />
          </div>
          <select
            className={styles.categorySelect}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Категория"
          >
            {PRODUCT_CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.toolbarRight}>
          <button
            type="button"
            className={styles.btnOutline}
            onClick={() => handleExport(filtered)}
          >
            <Download size={18} strokeWidth={2} aria-hidden />
            Экспорт CSV
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => navigate('/seller/products/new')}
          >
            <Plus size={18} strokeWidth={2} aria-hidden />
            Добавить товар
          </button>
        </div>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.productsTable}>
          <thead>
            <tr>
              <th>Товар</th>
              <th>Категория</th>
              <th>Цена</th>
              <th>Остаток</th>
              <th>Статус</th>
              <th aria-label="Действия" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr className={styles.emptyRow}>
                <td colSpan={6}>Товары не найдены</td>
              </tr>
            ) : (
              filtered.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className={styles.productCell}>
                      <span className={styles.productThumb} aria-hidden>
                        <Package size={20} strokeWidth={2} />
                      </span>
                      <div className={styles.productInfo}>
                        <p className={styles.productName}>{product.name}</p>
                        <p className={styles.productSku}>{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={styles.categoryText}>{product.category}</span>
                  </td>
                  <td>
                    <div className={styles.priceCell}>
                      <span className={styles.priceCurrent}>{formatPrice(product.price)}</span>
                      {product.compareAtPrice != null && (
                        <span className={styles.priceOld}>
                          {formatPrice(product.compareAtPrice)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={stockClass(product.stock)}>
                      {formatStock(product.stock)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${statusClass(product.status)}`}
                    >
                      {product.statusLabel}
                    </span>
                  </td>
                  <td className={styles.actionsCell}>
                    <button
                      type="button"
                      className={styles.rowActionBtn}
                      aria-label={`Действия: ${product.name}`}
                      onClick={() => navigate(`/seller/products/${product.id}/edit`)}
                    >
                      <MoreHorizontal size={20} strokeWidth={2} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
