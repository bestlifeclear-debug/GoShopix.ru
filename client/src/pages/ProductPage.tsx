import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreditCard, RotateCcw, ShieldCheck, Store } from 'lucide-react';
import { formatPrice } from '@goshopix/shared';
import { favoritesApi, productsApi } from '../api/index';
import type { ProductDetail, ProductListItem, ProductVariant } from '../api/types';
import { ImageGallery } from '../components/ImageGallery';
import { ProductGrid } from '../components/ProductGrid';
import { Tabs } from '../components/Tabs';
import { Button, ProductCardSkeleton, StarRating } from '../design-system';
import { snapshotFromDetail } from '../lib/cartSnapshot';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { ApiClientError } from '../api/client';
import { PageContainer } from '../components/layout/PageContainer';
import { ProductReviews } from '../components/ProductReviews/ProductReviews';
import { track } from '../lib/analytics';
import styles from './ProductPage.module.css';

const TRUST_SIGNALS = [
  { icon: ShieldCheck, label: 'Оригинальный товар' },
  { icon: CreditCard, label: 'Безопасная оплата' },
  { icon: RotateCcw, label: 'Возврат 14 дней' },
] as const;

function formatDeliveryPromise(deliveryDaysMin: number | null | undefined): string {
  const days = Math.max(1, deliveryDaysMin ?? 1);
  const date = new Date();
  date.setDate(date.getDate() + days);
  const dateLabel = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
  }).format(date);
  if (days === 1) return `Доставим завтра, ${dateLabel}`;
  return `Доставим ${dateLabel}`;
}

function StockStatus({ stock }: { stock: number }) {
  if (stock <= 0) {
    return <p className={styles.stockOut}>Нет в наличии</p>;
  }
  if (stock <= 5) {
    return <p className={styles.stockLow}>Осталось всего {stock} шт.</p>;
  }
  return <p className={styles.stock}>В наличии: {stock} шт.</p>;
}

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
  const [showMobileBar, setShowMobileBar] = useState(false);
  const buyBoxRef = useRef<HTMLDivElement>(null);

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
    if (!product) return;
    track('product_view', { productId: product.id });
  }, [product?.id]);

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

  useEffect(() => {
    if (loading || !product) return;

    const el = buyBoxRef.current;
    if (!el) return;

    const mq = window.matchMedia('(max-width: 768px)');

    const syncObserver = () => {
      if (!mq.matches) {
        setShowMobileBar(false);
        return undefined;
      }

      const observer = new IntersectionObserver(
        ([entry]) => setShowMobileBar(!entry.isIntersecting),
        { threshold: 0, rootMargin: '0px 0px -1px 0px' },
      );
      observer.observe(el);
      return () => observer.disconnect();
    };

    let teardown = syncObserver();
    const onMqChange = () => {
      teardown?.();
      teardown = syncObserver();
    };
    mq.addEventListener('change', onMqChange);

    return () => {
      teardown?.();
      mq.removeEventListener('change', onMqChange);
    };
  }, [loading, product?.id, selectedVariant?.id]);

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

  if (loading) {
    return (
      <PageContainer>
        <div className={styles.page} aria-busy="true" aria-label="Загрузка товара">
          <div className={styles.grid}>
            <div className={styles.skeletonGallery} />
            <aside className={styles.aside}>
              <div className={styles.skeletonMeta}>
                <span className={styles.skeletonLine} />
                <span className={`${styles.skeletonLine} ${styles.skeletonLineLg}`} />
                <span className={styles.skeletonLine} />
              </div>
              <div className={styles.skeletonBuyBox}>
                <span className={`${styles.skeletonLine} ${styles.skeletonLinePrice}`} />
                <span className={styles.skeletonBlock} />
                <span className={styles.skeletonBlock} />
                <span className={styles.skeletonBtn} />
              </div>
            </aside>
          </div>
          <section className={styles.related} aria-hidden>
            <span className={styles.skeletonSectionTitle} />
            <div className={styles.skeletonGrid}>
              {Array.from({ length: 4 }, (_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </section>
        </div>
      </PageContainer>
    );
  }
  if (!product) {
    return (
      <PageContainer>
        <p className={styles.message}>Товар не найден</p>
      </PageContainer>
    );
  }

  const images =
    selectedVariant?.images?.length && selectedVariant.images[0]?.url
      ? selectedVariant.images
      : product.images;

  const deliveryPromise = formatDeliveryPromise(product.deliveryDaysMin);
  const deliveryRangeText =
    product.deliveryDaysMin && product.deliveryDaysMax
      ? `${product.deliveryDaysMin}–${product.deliveryDaysMax} дней`
      : '2–5 дней';

  const thumbUrl = images[0]?.url ?? '';
  const outOfStock = !selectedVariant || selectedVariant.stock === 0;

  return (
    <PageContainer>
      <div className={`${styles.page} ${showMobileBar ? styles.pageWithMobileBar : ''}`}>
      <div className={styles.grid}>
        <ImageGallery images={images} name={product.name} />

        <aside className={styles.aside}>
          <div className={styles.productMeta}>
            {product.promoBadge && <span className={styles.promoRibbon}>{product.promoBadge}</span>}
            {product.brand && <p className={styles.brand}>{product.brand}</p>}
            <h1 className={styles.name}>{product.name}</h1>
            <div className={styles.ratingRow}>
              <StarRating value={product.rating} reviewCount={product.reviewCount} />
              {product.reviewCount > 0 && (
                <button type="button" className={styles.reviewsJump} onClick={() => setTab('reviews')}>
                  К отзывам ({product.reviewCount})
                </button>
              )}
            </div>
          </div>

          <div className={styles.asideSticky}>
          <div ref={buyBoxRef} className={styles.buyBox}>
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

          {selectedVariant && <StockStatus stock={selectedVariant.stock} />}

          <div className={styles.deliveryCard}>
            <h3 className={styles.deliveryTitle}>Доставка</h3>
            <p>
              По России: <strong>{deliveryPromise}</strong>
            </p>
            <p>Курьер или пункт выдачи — бесплатно от 2 000 ₽</p>
            <p className={styles.deliveryNote}>Возврат в течение 14 дней</p>
          </div>

          {product.store && (
            <p className={styles.sellerRow}>
              <Store size={16} strokeWidth={2} className={styles.sellerIcon} aria-hidden />
              <span className={styles.sellerLabel}>Продавец:</span>
              <span className={styles.sellerName}>{product.store.name}</span>
            </p>
          )}

          <div className={styles.buyBoxActions}>
            <Button
              size="lg"
              fullWidth
              className={styles.buyBoxCartBtn}
              onClick={handleAddToCart}
              disabled={outOfStock}
            >
              В корзину
            </Button>
            <Button variant="outline" size="lg" fullWidth onClick={toggleFavorite}>
              {isFavorite ? '♥ В избранном' : '♡ В избранное'}
            </Button>
          </div>

          <ul className={styles.trustRow} aria-label="Гарантии покупки">
            {TRUST_SIGNALS.map(({ icon: Icon, label }) => (
              <li key={label} className={styles.trustItem}>
                <Icon size={16} strokeWidth={2} className={styles.trustIcon} aria-hidden />
                <span>{label}</span>
              </li>
            ))}
          </ul>

          {msg && <p className={styles.msg}>{msg}</p>}
          </div>
          </div>
        </aside>
      </div>

      <div
        className={`${styles.mobileBar} ${showMobileBar ? styles.mobileBarVisible : ''}`}
        aria-hidden={!showMobileBar}
      >
        <div className={styles.mobileBarThumb} aria-hidden>
          {thumbUrl ? (
            <img src={thumbUrl} alt="" />
          ) : (
            <span className={styles.mobileBarThumbPlaceholder}>?</span>
          )}
        </div>
        <div className={styles.mobileBarPrice}>
          <span className={styles.mobileBarPriceValue}>{formatPrice(displayPrice)}</span>
          {compareAt != null && compareAt > displayPrice && (
            <span className={styles.mobileBarOldPrice}>{formatPrice(compareAt)}</span>
          )}
        </div>
        <Button
          size="lg"
          className={styles.mobileBarBtn}
          onClick={handleAddToCart}
          disabled={outOfStock}
        >
          В корзину
        </Button>
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
            <ProductReviews averageRating={product.rating} reviewCount={product.reviewCount} />
          </div>
        )}
        {tab === 'delivery' && (
          <div className={styles.tabContent}>
            <p>
              Доставка по России: {deliveryPromise} (ориентировочно {deliveryRangeText}).
            </p>
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
    </PageContainer>
  );
}
