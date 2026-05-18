import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatPrice } from '@goshopix/shared';
import { favoritesApi, productsApi } from '../api/index';
import type { ProductDetail, ProductListItem, ProductVariant } from '../api/types';
import { ImageGallery } from '../components/ImageGallery';
import { ProductGrid } from '../components/ProductGrid';
import { Tabs } from '../components/Tabs';
import { Button, StarRating } from '../design-system';
import { snapshotFromDetail } from '../lib/cartSnapshot';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { ApiClientError } from '../api/client';
import styles from './ProductPage.module.css';

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [similar, setSimilar] = useState<ProductListItem[]>([]);
  const [alsoBought, setAlsoBought] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('desc');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [isFavorite, setIsFavorite] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const token = useAuthStore((s) => s.token);
  const addToCart = useCartStore((s) => s.addToCart);
  const openDrawer = useCartStore((s) => s.openDrawer);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    productsApi
      .get(id)
      .then((p) => {
        setProduct(p);
        const def = p.variants.find((v) => v.isDefault) ?? p.variants[0] ?? null;
        setSelectedVariant(def);
        if (def) {
          const opts: Record<string, string> = {};
          for (const o of def.options) opts[o.name] = o.value;
          setSelectedOptions(opts);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!product?.category?.slug) return;
    void productsApi
      .list({ categorySlug: product.category.slug, limit: 8 })
      .then((res) => {
        const others = res.items.filter((p) => p.id !== product.id);
        setSimilar(others.slice(0, 4));
        setAlsoBought(others.slice(2, 6));
      })
      .catch(() => {});
  }, [product?.id, product?.category?.slug]);

  useEffect(() => {
    if (!token || !id) return;
    favoritesApi
      .list()
      .then((list) => setIsFavorite(list.some((f) => f.productId === id)))
      .catch(() => {});
  }, [token, id]);

  const optionGroups = useMemo(() => {
    if (!product) return new Map<string, string[]>();
    const groups = new Map<string, string[]>();
    for (const v of product.variants) {
      for (const opt of v.options) {
        const list = groups.get(opt.name) ?? [];
        if (!list.includes(opt.value)) list.push(opt.value);
        groups.set(opt.name, list);
      }
    }
    return groups;
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const match = product.variants.find((v) =>
      v.options.every((o) => selectedOptions[o.name] === o.value),
    );
    if (match) setSelectedVariant(match);
  }, [product, selectedOptions]);

  const displayPrice = selectedVariant?.price ?? product?.price ?? 0;
  const compareAt = product?.compareAtPrice ?? null;

  const handleAddToCart = async () => {
    if (!selectedVariant || !product) return;
    try {
      const snapshot = snapshotFromDetail(product, selectedVariant);
      await addToCart(selectedVariant.id, 1, snapshot);
      setMsg('Добавлено в корзину');
      if (!token) openDrawer();
    } catch (e) {
      setMsg(e instanceof ApiClientError ? e.message : 'Ошибка');
    }
  };

  const toggleFavorite = async () => {
    if (!token || !id) {
      navigate('/auth?returnUrl=' + encodeURIComponent(window.location.pathname));
      return;
    }
    try {
      if (isFavorite) {
        await favoritesApi.remove(id);
        setIsFavorite(false);
      } else {
        await favoritesApi.add(id);
        setIsFavorite(true);
      }
    } catch {
      setMsg('Не удалось обновить избранное');
    }
  };

  const handleSimilarAdd = async (p: ProductListItem) => {
    try {
      const detail = await productsApi.get(p.id);
      const variant = detail.variants.find((v) => v.isDefault) ?? detail.variants[0];
      if (!variant) return;
      await addToCart(variant.id, 1, snapshotFromDetail(detail, variant));
      if (!token) openDrawer();
    } catch (e) {
      setMsg(e instanceof ApiClientError ? e.message : 'Ошибка');
    }
  };

  if (loading) return <p className={styles.message}>Загрузка…</p>;
  if (!product) return <p className={styles.message}>Товар не найден</p>;

  const images =
    selectedVariant?.images?.length && selectedVariant.images[0]?.url
      ? selectedVariant.images
      : product.images;

  const deliveryText =
    product.deliveryDaysMin && product.deliveryDaysMax
      ? `${product.deliveryDaysMin}–${product.deliveryDaysMax} дней`
      : '2–5 дней';

  return (
    <div className={styles.page}>
      <div className={styles.grid}>
        <ImageGallery images={images} name={product.name} />

        <div className={styles.info}>
          {product.promoBadge && <span className={styles.promoRibbon}>{product.promoBadge}</span>}

          {product.brand && <p className={styles.brand}>{product.brand}</p>}
          <h1 className={styles.name}>{product.name}</h1>

          <div className={styles.ratingRow}>
            <StarRating value={product.rating} reviewCount={product.reviewCount} />
          </div>

          <div className={styles.priceBlock}>
            <span className={styles.price}>{formatPrice(displayPrice)}</span>
            {compareAt != null && compareAt > displayPrice && (
              <>
                <span className={styles.oldPrice}>{formatPrice(compareAt)}</span>
                {product.discountPercent != null && (
                  <span className={styles.discountTag}>−{product.discountPercent}%</span>
                )}
              </>
            )}
          </div>

          {[...optionGroups.entries()].map(([name, values]) => (
            <div key={name} className={styles.optionGroup}>
              <span className={styles.optionLabel}>{name}</span>
              <div className={styles.optionValues}>
                {values.map((val) => (
                  <button
                    key={val}
                    type="button"
                    className={`${styles.optionBtn} ${selectedOptions[name] === val ? styles.optionActive : ''}`}
                    onClick={() => setSelectedOptions((o) => ({ ...o, [name]: val }))}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {selectedVariant && (
            <p className={styles.stock}>
              {selectedVariant.stock > 0
                ? `В наличии: ${selectedVariant.stock} шт.`
                : 'Нет в наличии'}
            </p>
          )}

          <div className={styles.deliveryCard}>
            <h3 className={styles.deliveryTitle}>Доставка</h3>
            <p>
              По России: <strong>{deliveryText}</strong>
            </p>
            <p>Курьер или пункт выдачи — бесплатно от 2 000 ₽</p>
            <p className={styles.deliveryNote}>Возврат в течение 14 дней</p>
          </div>

          <div className={styles.actions}>
            <Button size="lg" onClick={handleAddToCart} disabled={!selectedVariant || selectedVariant.stock === 0}>
              В корзину
            </Button>
            <Button variant="outline" size="lg" onClick={toggleFavorite}>
              {isFavorite ? '♥ В избранном' : '♡ В избранное'}
            </Button>
          </div>
          {msg && <p className={styles.msg}>{msg}</p>}
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'desc', label: 'Описание' },
          { id: 'specs', label: 'Характеристики' },
          { id: 'reviews', label: `Отзывы (${product.reviewCount})` },
          { id: 'delivery', label: 'Доставка' },
          { id: 'qa', label: 'Вопросы' },
        ]}
        active={tab}
        onChange={setTab}
      >
        {tab === 'desc' && (
          <div className={styles.tabContent}>
            <p>{product.description || 'Описание отсутствует.'}</p>
          </div>
        )}
        {tab === 'specs' && (
          <table className={styles.specTable}>
            <tbody>
              {product.brand && (
                <tr>
                  <th>Бренд</th>
                  <td>{product.brand}</td>
                </tr>
              )}
              {product.attributes.map((a) => (
                <tr key={a.slug}>
                  <th>{a.name}</th>
                  <td>{a.value}</td>
                </tr>
              ))}
              {selectedVariant?.options.map((o) => (
                <tr key={o.id}>
                  <th>{o.name}</th>
                  <td>{o.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === 'reviews' && (
          <div className={styles.tabContent}>
            <div className={styles.reviewsSummary}>
              <span className={styles.reviewsBig}>{product.rating.toFixed(1)}</span>
              <StarRating value={product.rating} reviewCount={product.reviewCount} />
            </div>
            <p className={styles.placeholder}>
              Отзывы покупателей скоро появятся. Средняя оценка основана на демо-данных.
            </p>
          </div>
        )}
        {tab === 'delivery' && (
          <div className={styles.tabContent}>
            <p>Доставка по России: {deliveryText}.</p>
            <p>Отслеживание заказа в личном кабинете.</p>
            <p>Возврат в течение 14 дней при сохранении товарного вида.</p>
          </div>
        )}
        {tab === 'qa' && (
          <div className={styles.tabContent}>
            <div className={styles.qaItem}>
              <p className={styles.qaQ}>Подойдёт ли для подарка?</p>
              <p className={styles.qaA}>Да, товар поставляется в фирменной упаковке.</p>
            </div>
            <div className={styles.qaItem}>
              <p className={styles.qaQ}>Есть ли гарантия?</p>
              <p className={styles.qaA}>Официальная гарантия продавца 12 месяцев.</p>
            </div>
            <Button variant="outline" size="sm">
              Задать вопрос
            </Button>
          </div>
        )}
      </Tabs>

      {similar.length > 0 && (
        <section className={styles.related}>
          <h2 className={styles.relatedTitle}>Похожие товары</h2>
          <ProductGrid products={similar} onAddToCart={handleSimilarAdd} />
        </section>
      )}

      {alsoBought.length > 0 && (
        <section className={styles.related}>
          <h2 className={styles.relatedTitle}>С этим покупают</h2>
          <ProductGrid products={alsoBought} onAddToCart={handleSimilarAdd} />
        </section>
      )}
    </div>
  );
}
