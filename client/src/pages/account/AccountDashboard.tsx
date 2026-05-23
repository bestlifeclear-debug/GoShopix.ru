import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '@goshopix/shared';
import type { Order, ProductListItem } from '../../api/types';
import { cityDetectApi } from '../../api';
import { ProductGrid } from '../../components/ProductGrid';
import { Button } from '../../design-system';
import { DEFAULT_DELIVERY_CITY, readDeliveryCity, writeDeliveryCity } from '../../lib/deliveryCity';
import styles from '../AccountPage.module.css';
import {
  IconAddress,
  IconFavorites,
  IconLocation,
  IconOrders,
  IconProfile,
  IconSupport,
} from './AccountIcons';
import type { AccountSection } from './types';
import { useAccountMobileLayout } from './useAccountMobileLayout';
import { isActiveOrder, orderShortId, statusLabel, statusTone } from './utils';

interface AccountDashboardProps {
  displayName: string;
  avatarUrl?: string | null;
  orders: Order[];
  recommendations: ProductListItem[];
  onOpenOrder: (orderId: string) => void;
  onAllOrders: () => void;
  onNavigateSection: (id: AccountSection) => void;
  onLogout: () => void;
  onAddToCart?: (product: ProductListItem) => void | Promise<void>;
}

const MOBILE_QUICK_ACCESS: {
  id: AccountSection;
  label: string;
  icon: typeof IconOrders;
}[] = [
  { id: 'orders', label: 'Мои заказы', icon: IconOrders },
  { id: 'favorites', label: 'Избранное', icon: IconFavorites },
];

const MOBILE_SETTINGS_ITEMS: {
  id: AccountSection;
  label: string;
  icon: typeof IconProfile;
}[] = [
  { id: 'profile', label: 'Личные данные', icon: IconProfile },
  { id: 'addresses', label: 'Адреса доставки', icon: IconAddress },
  { id: 'support', label: 'Поддержка', icon: IconSupport },
];

function profileInitial(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  return trimmed.charAt(0).toUpperCase();
}

export function AccountDashboard({
  displayName,
  avatarUrl,
  orders,
  recommendations,
  onOpenOrder,
  onAllOrders,
  onNavigateSection,
  onLogout,
  onAddToCart,
}: AccountDashboardProps) {
  const isCompactMobile = useAccountMobileLayout();
  const [deliveryCity, setDeliveryCity] = useState(() => readDeliveryCity() ?? DEFAULT_DELIVERY_CITY);
  const activeOrders = orders.filter(isActiveOrder).slice(0, 3);

  useEffect(() => {
    if (!isCompactMobile) return;
    const stored = readDeliveryCity();
    if (stored) {
      setDeliveryCity(stored);
      return;
    }
    void cityDetectApi.detect().then((res) => {
      const detected = res.city?.trim();
      if (!detected) return;
      writeDeliveryCity(detected);
      setDeliveryCity(detected);
    });
  }, [isCompactMobile]);

  const recommendationsSection = isCompactMobile ? (
    <section
      id="account-reco"
      className={styles.mobileRecoSection}
      aria-labelledby="reco-title"
    >
      <div className={styles.mobileRecoHead}>
        <h2 id="reco-title" className={styles.mobileSectionTitle}>
          Персональные рекомендации
        </h2>
        <Link to="/catalog" className={styles.textLink}>
          Весь каталог
        </Link>
      </div>
      {recommendations.length === 0 ? (
        <p className={styles.recoEmpty}>Рекомендации появятся после просмотра каталога.</p>
      ) : (
        <div className={styles.mobileRecoGrid}>
          <ProductGrid
            products={recommendations}
            variant="compact"
            onAddToCart={onAddToCart}
          />
        </div>
      )}
    </section>
  ) : (
    <section id="account-reco" className={styles.recoBlock} aria-labelledby="reco-title">
      <div className={styles.recoHead}>
        <h2 id="reco-title" className={styles.blockSubtitle}>
          Персональные рекомендации
        </h2>
        <Link to="/catalog" className={styles.textLink}>
          Весь каталог
        </Link>
      </div>
      {recommendations.length === 0 ? (
        <p className={styles.recoEmpty}>Рекомендации появятся после просмотра каталога.</p>
      ) : (
        <ul className={styles.recoGrid}>
          {recommendations.map((p) => (
            <li key={p.id}>
              <Link to={`/product/${p.id}`} className={styles.recoCard} data-lk-reco>
                <span className={styles.recoImg}>
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt="" loading="lazy" />
                  ) : (
                    <span className={styles.recoImgFallback}>{p.name.charAt(0)}</span>
                  )}
                </span>
                <span className={styles.recoName}>{p.name}</span>
                <span className={styles.recoPrice}>{formatPrice(p.price)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );

  if (isCompactMobile) {
    return (
      <div className={`${styles.dashboard} ${styles.dashboardMobile}`}>
        <div className={styles.mobileDash}>
          <header className={styles.mobileProfileHeader}>
            <div className={styles.mobileAvatar} aria-hidden>
              {avatarUrl ? (
                <img src={avatarUrl} alt="" />
              ) : (
                <span>{profileInitial(displayName)}</span>
              )}
            </div>
            <div className={styles.mobileProfileMeta}>
              <p className={styles.mobileProfileName}>{displayName}</p>
              <p className={styles.mobileLocationBadge}>
                <IconLocation />
                <span>{deliveryCity}</span>
              </p>
            </div>
          </header>

          <section className={styles.mobileOrdersCard} aria-labelledby="mobile-orders-title">
            <h2 id="mobile-orders-title" className={styles.mobileOrdersTitle}>
              Активные заказы
            </h2>
            {activeOrders.length === 0 ? (
              <>
                <p className={styles.mobileOrdersEmptyText}>
                  У вас пока нет активных заказов. Самое время выбрать что-нибудь в каталоге!
                </p>
                <Link to="/catalog" className={styles.mobileCatalogBtn}>
                  Перейти в каталог
                </Link>
              </>
            ) : (
              <>
                <ul className={styles.activeOrdersList}>
                  {activeOrders.map((order) => {
                    const tone = statusTone(order.status);
                    return (
                      <li key={order.id}>
                        <button
                          type="button"
                          data-lk-order-card
                          className={styles.activeOrderCard}
                          onClick={() => onOpenOrder(order.id)}
                        >
                          <span className={styles.activeOrderId}>№ {orderShortId(order.id)}</span>
                          <span className={`${styles.statusDot} ${styles[`status_${tone}`]}`}>
                            {statusLabel(order)}
                          </span>
                          <span className={styles.activeOrderMeta}>
                            {new Date(order.createdAt).toLocaleDateString('ru-RU')} ·{' '}
                            {formatPrice(order.totalAmount)}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <button type="button" className={styles.textLink} onClick={onAllOrders}>
                  Все заказы
                </button>
              </>
            )}
          </section>

          <section className={styles.mobileQuickSection} aria-labelledby="mobile-quick-title">
            <h2 id="mobile-quick-title" className={styles.mobileSectionTitle}>
              Быстрый доступ
            </h2>
            <div className={styles.mobileQuickGrid}>
              {MOBILE_QUICK_ACCESS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={styles.mobileQuickCard}
                    onClick={() => onNavigateSection(item.id)}
                  >
                    <span className={styles.mobileQuickCardIcon} aria-hidden>
                      <Icon />
                    </span>
                    <span className={styles.mobileQuickCardLabel}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className={styles.mobileSettingsSection} aria-labelledby="mobile-settings-title">
            <h2 id="mobile-settings-title" className={styles.mobileSectionTitle}>
              Настройки
            </h2>
            <nav className={styles.mobileSettingsCard} aria-label="Настройки профиля">
              <ul className={styles.mobileSettingsList}>
                {MOBILE_SETTINGS_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={styles.mobileSettingsRow}
                        onClick={() => onNavigateSection(item.id)}
                      >
                        <span className={styles.mobileSettingsIcon} aria-hidden>
                          <Icon />
                        </span>
                        <span className={styles.mobileSettingsLabel}>{item.label}</span>
                        <span className={styles.mobileSettingsChevron} aria-hidden>
                          ›
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </section>

          <button type="button" className={styles.mobileLogoutBtn} onClick={onLogout}>
            Выйти
          </button>
        </div>

        {recommendationsSection}
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <section className={styles.welcomeBlock} aria-labelledby="welcome-title">
        <h1 id="welcome-title" className={styles.welcomeTitle}>
          Добро пожаловать, {displayName}
        </h1>

        <div className={styles.ordersBlock}>
          <h2 className={styles.blockSubtitle}>Активные заказы</h2>
          {activeOrders.length === 0 ? (
            <div className={styles.emptyOrders}>
              <p className={styles.emptyOrdersText}>
                У вас пока нет активных заказов. Самое время выбрать что-нибудь в каталоге!
              </p>
              <Link to="/catalog">
                <Button>Перейти в каталог</Button>
              </Link>
            </div>
          ) : (
            <>
              <ul className={styles.activeOrdersList}>
                {activeOrders.map((order) => {
                  const tone = statusTone(order.status);
                  return (
                    <li key={order.id}>
                      <button
                        type="button"
                        data-lk-order-card
                        className={styles.activeOrderCard}
                        onClick={() => onOpenOrder(order.id)}
                      >
                        <span className={styles.activeOrderId}>№ {orderShortId(order.id)}</span>
                        <span className={`${styles.statusDot} ${styles[`status_${tone}`]}`}>
                          {statusLabel(order)}
                        </span>
                        <span className={styles.activeOrderMeta}>
                          {new Date(order.createdAt).toLocaleDateString('ru-RU')} ·{' '}
                          {formatPrice(order.totalAmount)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <button type="button" className={styles.textLink} onClick={onAllOrders}>
                Все заказы
              </button>
            </>
          )}
        </div>
      </section>

      {recommendationsSection}
    </div>
  );
}
