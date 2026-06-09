import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronDown, Heart, Package, RotateCcw, Store, Truck } from 'lucide-react';
import { formatPrice } from '@goshopix/shared';
import { favoritesApi, productsApi } from '../api/index';
import type { ProductDetail, ProductListItem, ProductVariant } from '../api/types';
import { ImageGallery } from '../components/ImageGallery';
import { Tabs } from '../components/Tabs';
import { Button, ProductCardSkeleton, StarRating } from '../design-system';
import { snapshotFromDetail } from '../lib/cartSnapshot';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { mapApiError } from '../api/mapApiError';
import { PageContainer } from '../components/layout/PageContainer';
import { ProductReviews } from '../components/ProductReviews/ProductReviews';
import { getInitialQuestions } from '../components/ProductQa/mockQuestions';
import { ProductQa } from '../components/ProductQa/ProductQa';
import { QuestionWriteModal } from '../components/ProductQa/QuestionWriteModal';
import { ProductRelatedRail } from '../components/ProductRail/ProductRelatedRail';
import { track } from '../lib/analytics';
import { showInfoToast } from '../stores/toastStore';
import styles from './ProductPage.module.css';

type DetailsTab = 'description' | 'specs' | 'store';

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

function isOptionValueAvailable(
  product: ProductDetail,
  optionName: string,
  optionValue: string,
  selectedOptions: Record<string, string>,
): boolean {
  return product.variants.some((variant) => {
    if (variant.stock <= 0) return false;
    return variant.options.every((opt) => {
      if (opt.name === optionName) return opt.value === optionValue;
      const selected = selectedOptions[opt.name];
      return !selected || opt.value === selected;
    });
  });
}

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) {
    return <span className={styles.stockBadgeOut}>Нет в наличии</span>;
  }
  if (stock <= 5) {
    return <span className={styles.stockBadgeLow}>Осталось {stock} шт.</span>;
  }
  return null;
}

function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`${styles.collapsible} ${open ? styles.collapsibleOpen : ''}`}>
      <button
        type="button"
        className={styles.collapsibleTrigger}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{title}</span>
        <ChevronDown size={20} strokeWidth={2} className={styles.collapsibleIcon} aria-hidden />
      </button>
      {open && <div className={styles.collapsibleBody}>{children}</div>}
    </div>
  );
}

function StoreCard({
  product,
  deliveryRangeText,
  flat = false,
}: {
  product: ProductDetail;
  deliveryRangeText: string;
  flat?: boolean;
}) {
  return (
    <div className={flat ? `${styles.storeCard} ${styles.storeCardFlat}` : styles.storeCard}>
      <h2 className={styles.storeCardTitle}>О магазине</h2>
      <p className={styles.storeLine}>
        <Store size={18} strokeWidth={2} className={styles.storeIcon} aria-hidden />
        <span className={styles.storeLabel}>Продавец:</span>
        <strong className={styles.storeName}>{product.store?.name ?? '—'}</strong>
      </p>
      <div className={styles.storeKpis}>
        <div className={styles.kpi}>
          <span className={styles.kpiLabel}>Рейтинг товара</span>
          <span className={styles.kpiValue}>{product.rating.toFixed(1)} / 5</span>
        </div>
        <div className={styles.kpi}>
          <span className={styles.kpiLabel}>Отзывы</span>
          <span className={styles.kpiValue}>{product.reviewCount}</span>
        </div>
        <div className={styles.kpi}>
          <span className={styles.kpiLabel}>Доставка</span>
          <span className={styles.kpiValue}>{deliveryRangeText}</span>
        </div>
      </div>
      <p className={styles.storeHint}>
        Проверяйте продавца и условия доставки перед оплатой — мы показываем основные данные прямо в
        карточке.
      </p>
    </div>
  );
}

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [similar, setSimilar] = useState<ProductListItem[]>([]);
  const [alsoBought, setAlsoBought] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('reviews');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [isFavorite, setIsFavorite] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [showMobileBar, setShowMobileBar] = useState(false);
  const [detailsTab, setDetailsTab] = useState<DetailsTab>('description');
  const [deliveryExpanded, setDeliveryExpanded] = useState(false);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const buyBoxActionsRef = useRef<HTMLDivElement>(null);

  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const questionAuthorName = user?.profile?.name?.trim() || null;
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
        setSimilar(others.slice(0, 8));
        setAlsoBought(others.slice(2, 10));
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
  const hasDiscount = compareAt != null && compareAt > displayPrice;

  useEffect(() => {
    if (loading || !product) return;

    const el = buyBoxActionsRef.current;
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
      setMsg(mapApiError(e, 'Не удалось добавить в корзину'));
    }
  };

  const handleBuyNow = async () => {
    if (!selectedVariant || !product) return;
    try {
      const snapshot = snapshotFromDetail(product, selectedVariant);
      await addToCart(selectedVariant.id, 1, snapshot);
      if (!token) {
        navigate('/auth?returnUrl=' + encodeURIComponent('/checkout'));
        return;
      }
      navigate('/checkout');
    } catch (e) {
      setMsg(mapApiError(e, 'Не удалось оформить заказ'));
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
      setMsg(mapApiError(e, 'Не удалось добавить в корзину'));
    }
  };

  if (loading) {
    return (
      <PageContainer className={styles.pageContainer}>
        <div className={styles.page} aria-busy="true" aria-label="Загрузка товара">
          <div className={styles.heroGrid}>
            <div className={styles.gallerySection}>
              <div className={styles.skeletonGallery} />
            </div>
            <div className={styles.buySection}>
              <div className={styles.skeletonMeta}>
                <span className={styles.skeletonLine} />
                <span className={`${styles.skeletonLine} ${styles.skeletonLineLg}`} />
                <span className={styles.skeletonLine} />
              </div>
              <div className={styles.skeletonBuyBox}>
                <span className={`${styles.skeletonLine} ${styles.skeletonLinePrice}`} />
                <span className={styles.skeletonBlock} />
                <span className={styles.skeletonBtn} />
              </div>
            </div>
          </div>
          <section className={styles.related} aria-hidden>
            <span className={styles.skeletonSectionTitle} />
            <div className={styles.skeletonRail}>
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

  const outOfStock = !selectedVariant || selectedVariant.stock === 0;
  const description = product.description || 'Описание отсутствует.';
  const deliveryShort = deliveryPromise.replace(/^Доставим\s+/i, '');
  const qaCount = getInitialQuestions().length;

  const scrollToReviews = () => {
    setTab('reviews');
    document.getElementById('pdp-reviews-full')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToStore = () => {
    setDetailsTab('store');
    const target = window.matchMedia('(max-width: 768px)').matches
      ? document.getElementById('pdp-details')
      : document.getElementById('pdp-store-desktop');
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const priceHeadline = (
    <div className={styles.priceHeadline}>
      <div className={styles.priceRow}>
        <span className={`${styles.price} ${hasDiscount ? styles.priceOnSale : ''}`}>
          {formatPrice(displayPrice)}
        </span>
        {hasDiscount && (
          <>
            <span className={styles.oldPrice}>{formatPrice(compareAt)}</span>
            {product.discountPercent != null && (
              <span className={styles.discountTag}>−{product.discountPercent}%</span>
            )}
          </>
        )}
        {selectedVariant && <StockBadge stock={selectedVariant.stock} />}
      </div>
      <span className={styles.priceHint}>Цена за 1 шт.</span>
      {product.reviewCount > 0 && (
        <button type="button" className={styles.ratingLink} onClick={scrollToReviews}>
          <StarRating
            value={product.rating}
            reviewCount={product.reviewCount}
            size="sm"
            showValue
          />
        </button>
      )}
    </div>
  );

  const buyBoxContent = (
    <>
      {[...optionGroups.entries()].map(([name, values]) => {
        const isSizeGroup = name === 'Размер' || values.some((v) => /\d+\s*мм/i.test(v));
        const selectedValue = selectedOptions[name];
        return (
          <div key={name} className={styles.optionGroup}>
            <span className={styles.optionLabel}>
              {name}
              {selectedValue ? `: ${selectedValue}` : ''}
            </span>
            <div className={styles.optionValues}>
              {values.map((val) => {
                const available = isOptionValueAvailable(product, name, val, selectedOptions);
                return (
                  <button
                    key={val}
                    type="button"
                    disabled={!available}
                    className={`${styles.optionBtn} ${isSizeGroup ? styles.optionBtnCompact : ''} ${selectedValue === val ? styles.optionActive : ''} ${!available ? styles.optionUnavailable : ''}`}
                    onClick={() => setSelectedOptions((o) => ({ ...o, [name]: val }))}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <div ref={buyBoxActionsRef} className={styles.buyBoxActions}>
        <Button
          size="lg"
          fullWidth
          className={styles.btnPrimary}
          onClick={handleAddToCart}
          disabled={outOfStock}
        >
          Добавить в корзину
        </Button>
        <button
          type="button"
          className={styles.buyNowLink}
          onClick={handleBuyNow}
          disabled={outOfStock}
        >
          Купить в 1 клик
        </button>
        <button
          type="button"
          className={`${styles.favBtn} ${isFavorite ? styles.favBtnActive : ''}`}
          onClick={toggleFavorite}
          aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
        >
          <Heart size={18} strokeWidth={2} fill={isFavorite ? 'currentColor' : 'none'} aria-hidden />
          <span>{isFavorite ? 'В избранном' : 'В избранное'}</span>
        </button>
      </div>

      <p className={styles.trustCompact}>
        <RotateCcw size={15} strokeWidth={2} className={styles.trustCompactIcon} aria-hidden />
        <span>Возврат в течение 14 дней</span>
      </p>

      <div className={styles.deliveryCompact}>
        <button
          type="button"
          className={styles.deliverySummary}
          aria-expanded={deliveryExpanded}
          onClick={() => setDeliveryExpanded((v) => !v)}
        >
          <Truck size={16} strokeWidth={2} className={styles.deliverySummaryIcon} aria-hidden />
          <span className={styles.deliverySummaryText}>
            <strong>{deliveryShort}</strong>
            <span className={styles.deliverySummaryMuted}> · бесплатно от 2 000 ₽</span>
          </span>
          <ChevronDown
            size={18}
            strokeWidth={2}
            className={`${styles.deliveryChevron} ${deliveryExpanded ? styles.deliveryChevronOpen : ''}`}
            aria-hidden
          />
        </button>
        {deliveryExpanded && (
          <ul className={styles.deliveryList}>
            <li className={styles.deliveryItem}>
              <Truck size={15} strokeWidth={2} className={styles.deliveryIcon} aria-hidden />
              <span>Курьер — бесплатно от 2 000 ₽</span>
            </li>
            <li className={styles.deliveryItem}>
              <Package size={15} strokeWidth={2} className={styles.deliveryIcon} aria-hidden />
              <span>Пункт выдачи — бесплатно от 2 000 ₽</span>
            </li>
          </ul>
        )}
      </div>

      {product.store && (
        <p className={styles.sellerRow}>
          <Store size={16} strokeWidth={2} className={styles.sellerIcon} aria-hidden />
          <span className={styles.sellerLabel}>Продавец:</span>
          <button type="button" className={styles.sellerLink} onClick={scrollToStore}>
            {product.store.name}
          </button>
        </p>
      )}

      {msg && <p className={styles.msg}>{msg}</p>}
    </>
  );

  const specRows = (
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
  );

  return (
    <PageContainer className={styles.pageContainer}>
      <div className={`${styles.page} ${showMobileBar ? styles.pageWithMobileBar : ''}`}>
        <div className={styles.heroGrid}>
          <div className={styles.gallerySection}>
            <div className={styles.galleryFrame}>
              <ImageGallery images={images} name={product.name} />
            </div>
          </div>

          <div className={`${styles.buySection} ${styles.contentPad}`}>
            <div className={styles.productMeta}>
              {product.brand && <p className={styles.brand}>{product.brand}</p>}
              <h1 className={styles.name}>{product.name}</h1>
              {priceHeadline}
            </div>

            <div className={styles.buyBox}>
              {buyBoxContent}
            </div>

            {alsoBought.length > 0 && (
              <div className={styles.earlyRelated}>
                <ProductRelatedRail
                  title="С этим покупают"
                  products={alsoBought}
                  onAddToCart={handleSimilarAdd}
                />
              </div>
            )}
          </div>

          <div id="pdp-details" className={`${styles.detailsSection} ${styles.contentPad}`}>
            <div className={styles.detailsTabs} role="tablist" aria-label="Информация о товаре">
              {(
                [
                  { id: 'description' as const, label: 'Описание' },
                  { id: 'specs' as const, label: 'Характеристики' },
                  { id: 'store' as const, label: 'О магазине' },
                ]
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={detailsTab === item.id}
                  className={`${styles.detailsTab} ${detailsTab === item.id ? styles.detailsTabActive : ''}`}
                  onClick={() => setDetailsTab(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div
              id="pdp-description"
              role="tabpanel"
              className={`${styles.detailsTabPanel} ${detailsTab === 'description' ? styles.detailsTabPanelActive : ''}`}
            >
              <p className={styles.detailsText}>{description}</p>
            </div>

            <div
              role="tabpanel"
              className={`${styles.detailsTabPanel} ${detailsTab === 'specs' ? styles.detailsTabPanelActive : ''}`}
            >
              {specRows}
            </div>

            <div
              role="tabpanel"
              className={`${styles.detailsTabPanel} ${detailsTab === 'store' ? styles.detailsTabPanelActive : ''}`}
            >
              <StoreCard product={product} deliveryRangeText={deliveryRangeText} flat />
            </div>

            <div className={styles.detailsDesktopOnly}>
              <div id="pdp-description-desktop" className={styles.detailsCard}>
                <CollapsibleSection title="Описание" defaultOpen>
                  <p className={styles.detailsText}>{description}</p>
                </CollapsibleSection>
              </div>

              <div className={styles.detailsCard}>
                <CollapsibleSection title="Характеристики">{specRows}</CollapsibleSection>
              </div>

              <div id="pdp-store-desktop">
                <StoreCard product={product} deliveryRangeText={deliveryRangeText} />
              </div>
            </div>
          </div>
        </div>

        <div
          className={`${styles.mobileBar} ${showMobileBar ? styles.mobileBarVisible : ''}`}
          aria-hidden={!showMobileBar}
        >
          <div className={styles.mobileBarPrice}>
            <span className={`${styles.mobileBarPriceValue} ${hasDiscount ? styles.mobileBarPriceOnSale : ''}`}>
              {formatPrice(displayPrice)}
            </span>
            {hasDiscount && (
              <span className={styles.mobileBarOldPrice}>{formatPrice(compareAt)}</span>
            )}
          </div>
          <div className={styles.mobileBarBtnWrap}>
            <Button
              size="lg"
              className={styles.mobileBarBtn}
              onClick={handleAddToCart}
              disabled={outOfStock}
            >
              <span className={styles.mobileBarBtnContent}>
                <span>В корзину</span>
                <span className={styles.mobileBarBtnHint}>{deliveryShort}</span>
              </span>
            </Button>
          </div>
        </div>

        <div id="pdp-reviews-full" className={styles.socialSection}>
          <div className={styles.socialSectionInner}>
            <Tabs
              variant="pdp"
              tabs={[
                { id: 'reviews', label: `Отзывы (${product.reviewCount})` },
                { id: 'qa', label: qaCount > 0 ? `Вопросы (${qaCount})` : 'Вопросы' },
              ]}
              active={tab}
              onChange={setTab}
            >
              {tab === 'reviews' && (
                <ProductReviews averageRating={product.rating} reviewCount={product.reviewCount} />
              )}
              {tab === 'qa' && (
                <div className={styles.qaPanel}>
                  <button
                    type="button"
                    className={styles.askQuestionBtn}
                    onClick={() => setQuestionModalOpen(true)}
                  >
                    Задать вопрос
                  </button>
                  <ProductQa />
                </div>
              )}
            </Tabs>
          </div>
        </div>

        <QuestionWriteModal
          open={questionModalOpen}
          onClose={() => setQuestionModalOpen(false)}
          isAuthenticated={!!token}
          userName={questionAuthorName}
          onRequireAuth={() => {
            setQuestionModalOpen(false);
            navigate(
              '/auth?returnUrl=' +
                encodeURIComponent(window.location.pathname + window.location.search),
            );
          }}
          onSubmit={() => showInfoToast('Вопрос отправлен. Ответ появится после модерации.')}
        />

        {similar.length > 0 && (
          <div className={`${styles.related} ${styles.contentPad}`}>
            <ProductRelatedRail
              title="Похожие товары"
              products={similar}
              onAddToCart={handleSimilarAdd}
            />
          </div>
        )}

      </div>
    </PageContainer>
  );
}
