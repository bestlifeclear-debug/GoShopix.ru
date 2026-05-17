import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '@goshopix/shared';
import { Button, Input } from '../../design-system';
import { sellerApi } from '../api/index';
import type { SellerProductListItem } from '../api/types';
import { DataTable, type DataTableColumn } from '../components/DataTable';
import { exportCsv } from '../components/exportCsv';
import styles from './sellerPages.module.css';

export function ProductsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<SellerProductListItem[]>([]);
  const [q, setQ] = useState('');
  const [published, setPublished] = useState<string>('');
  const [editing, setEditing] = useState<Record<string, { price?: string; stock?: string }>>({});

  const load = useCallback(() => {
    sellerApi.products
      .list({
        page: 1,
        limit: 100,
        q: q || undefined,
        isPublished: published === '' ? undefined : published === 'true',
      })
      .then((r) => setItems(r.items));
  }, [q, published]);

  useEffect(() => {
    load();
  }, [load]);

  const saveVariant = async (variantId: string, productId: string) => {
    const e = editing[variantId];
    if (!e) return;
    const body: { price?: number; stock?: number } = {};
    if (e.price !== undefined && e.price !== '') body.price = Number(e.price);
    if (e.stock !== undefined && e.stock !== '') body.stock = Number(e.stock);
    if (!Object.keys(body).length) return;
    await sellerApi.products.patchVariant(variantId, body);
    setEditing((prev) => {
      const next = { ...prev };
      delete next[variantId];
      return next;
    });
    void load();
    void productId;
  };

  const columns: DataTableColumn<SellerProductListItem>[] = [
    {
      key: 'name',
      header: 'Товар',
      sortable: true,
      sortValue: (r) => r.name,
      csvValue: (r) => r.name,
      render: (r) => (
        <Link className={styles.link} to={`/seller/products/${r.id}/edit`}>
          {r.name}
        </Link>
      ),
    },
    {
      key: 'price',
      header: 'Цена',
      sortable: true,
      sortValue: (r) => r.price,
      csvValue: (r) => r.price,
      render: (r) => {
        const v = r.variants.find((x) => x.isDefault) ?? r.variants[0];
        if (!v) return formatPrice(r.price);
        return (
          <Input
            className={styles.inlineInput}
            type="number"
            value={editing[v.id]?.price ?? String(v.price)}
            onChange={(e) =>
              setEditing((prev) => ({
                ...prev,
                [v.id]: { ...prev[v.id], price: e.target.value },
              }))
            }
            onBlur={() => void saveVariant(v.id, r.id)}
          />
        );
      },
    },
    {
      key: 'stock',
      header: 'Остаток',
      sortable: true,
      sortValue: (r) => r.totalStock,
      csvValue: (r) => r.totalStock,
      render: (r) => {
        const v = r.variants.find((x) => x.isDefault) ?? r.variants[0];
        if (!v) return r.totalStock;
        return (
          <Input
            className={styles.inlineInput}
            type="number"
            value={editing[v.id]?.stock ?? String(v.stock)}
            onChange={(e) =>
              setEditing((prev) => ({
                ...prev,
                [v.id]: { ...prev[v.id], stock: e.target.value },
              }))
            }
            onBlur={() => void saveVariant(v.id, r.id)}
          />
        );
      },
    },
    {
      key: 'published',
      header: 'Статус',
      sortable: true,
      sortValue: (r) => (r.isPublished ? 1 : 0),
      csvValue: (r) => (r.isPublished ? 'Опубликован' : 'Черновик'),
      render: (r) => (r.isPublished ? 'Опубликован' : 'Черновик'),
    },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className={styles.rowActions}>
          <Link className={styles.link} to={`/seller/products/${r.id}/edit`}>
            Изменить
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (confirm('Удалить товар?')) {
                sellerApi.products.remove(r.id).then(load);
              }
            }}
          >
            Удалить
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1 className={styles.pageTitle}>Товары</h1>
      <div className={styles.filters}>
        <Input placeholder="Поиск…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={published} onChange={(e) => setPublished(e.target.value)}>
          <option value="">Все</option>
          <option value="true">Опубликованные</option>
          <option value="false">Черновики</option>
        </select>
        <Button type="button" onClick={() => navigate('/seller/products/new')}>
          Добавить товар
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={items}
        keyField={(r) => r.id}
        onExportCsv={(h, rows) => exportCsv('products.csv', h, rows)}
        toolbar={null}
      />
    </div>
  );
}
