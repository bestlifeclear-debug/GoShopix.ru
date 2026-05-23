import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '@goshopix/shared';
import type { Order, ProductListItem } from '../../api/types';
import { Button } from '../../design-system';
import styles from '../AccountPage.module.css';
import { AccountMobileSettingsSheet } from './AccountMobileSettingsSheet';
import {
  IconAddress,
  IconFavorites,
  IconOrders,
  IconRecommend,
  IconSettings,
} from './AccountIcons';
import type { AccountSection } from './types';
import { useAccountMobileLayout } from './useAccountMobileLayout';
import { isActiveOrder, orderShortId, statusLabel, statusTone } from './utils';

interface AccountDashboardProps {
  displayName: string;
  orders: Order[];
  recommendations: ProductListItem[];
  onOpenOrder: (orderId: string) => void;
  onAllOrders: () => void;
  onNavigateSection: (id: AccountSection) => void;
  onLogout: () => void;
}

const MOBILE_QUICK_TILES: {
  id: AccountSection | 'reco';
  label: string;
  icon: typeof IconOrders;
}[] = [
  { id: 'orders', label: 'Мои заказы', icon: IconOrders },
  { id: 'favorites', label: 'Избранное', icon: IconFavorites },
  { id: 'addresses', label: 'Адреса доставки', icon: IconAddress },
  { id: 'reco', label: 'Персональные рекомендации', icon: IconRecommend },
];

export function AccountDashboard({
  displayName,
  orders,
  recommendations,
  onOpenOrder,
  onAllOrders,
  onNavigateSection,
  onLogout,
}: AccountDashboardProps) {
  const isCompactMobile = useAccountMobileLayout();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const activeOrders = orders.filter(isActiveOrder).slice(0, 3);

  const scrollToRecommendations = () => {
    document.getElementById('account-reco')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleQuickTile = (id: AccountSection | 'reco') => {
    if (id === 'reco') {
      scrollToRecommendations();
      return;
    }
    onNavigateSection(id);
  };

  return (
    <div className={styles.dashboard}>
      <section
        className={`${styles.welcomeBlock} ${isCompactMobile ? styles.welcomeBlockMobile : ''}`}
        aria-labelledby="welcome-title"
      >
        {isCompactMobile ? (
          <div className={styles.welcomeHead}>
            <h1 id="welcome-title" className={styles.welcomeTitleMobile}>
              Добро пожаловать, {displayName}
            </h1>
            <button
              type="button"
              className={styles.settingsBtn}
              aria-label="Настройки личного кабинета"
              aria-expanded={settingsOpen}
              onClick={() => setSettingsOpen((open) => !open)}
            >
              <IconSettings />
            </button>
          </div>
        ) : (
          <h1 id="welcome-title" className={styles.welcomeTitle}>
            Добро пожаловать, {displayName}
          </h1>
        )}

        <div className={isCompactMobile ? styles.ordersBlockMobile : styles.ordersBlock}>
          <h2 className={styles.blockSubtitle}>Активные заказы</h2>
          {activeOrders.length === 0 ? (
            <div className={`${styles.emptyOrders} ${isCompactMobile ? styles.emptyOrdersMobile : ''}`}>
              <p className={styles.emptyOrdersText}>
                У вас пока нет активных заказов. Самое время выбрать что-нибудь в каталоге!
              </p>
              <Link to="/catalog" className={isCompactMobile ? styles.catalogLinkFull : undefined}>
                <Button fullWidth={isCompactMobile}>Перейти в каталог</Button>
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

        {isCompactMobile && (
          <nav className={styles.mobileQuickGrid} aria-label="Разделы личного кабинета">
            <ul className={styles.mobileQuickGridList}>
              {MOBILE_QUICK_TILES.map((tile) => {
                const Icon = tile.icon;
                return (
                  <li key={tile.id}>
                    <button
                      type="button"
                      className={styles.mobileQuickTile}
                      onClick={() => handleQuickTile(tile.id)}
                    >
                      <span className={styles.mobileQuickTileIcon} aria-hidden>
                        <Icon />
                      </span>
                      <span className={styles.mobileQuickTileLabel}>{tile.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </section>

      <section
        id="account-reco"
        className={`${styles.recoBlock} ${isCompactMobile ? styles.recoBlockMobile : ''}`}
        aria-labelledby="reco-title"
      >
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

      <AccountMobileSettingsSheet
        open={isCompactMobile && settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onNavigate={onNavigateSection}
        onLogout={onLogout}
      />
    </div>
  );
}
