import { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { favoritesApi, notificationsApi, ordersApi, productsApi } from '../api/index';
import { snapshotFromDetail } from '../lib/cartSnapshot';
import type { FavoriteItem, NotificationItem, NotificationSettings, Order, ProductListItem } from '../api/types';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { AccountDashboard } from './account/AccountDashboard';
import { AccountFavorites } from './account/AccountFavorites';
import { AccountNotifications } from './account/AccountNotifications';
import { AccountOrders } from './account/AccountOrders';
import { AccountPlaceholder } from './account/AccountPlaceholder';
import { AccountProfile } from './account/AccountProfile';
import { AccountSupport } from './account/AccountSupport';
import { AccountLayout } from '../components/layout/AccountLayout';
import { AccountProfileBar } from './account/AccountProfileBar';
import { AccountSidebar } from './account/AccountSidebar';
import { useAccountMobileLayout } from './account/useAccountMobileLayout';
import { SECTION_TITLES } from './account/constants';
import type { AccountSection } from './account/types';
import { resolveSection } from './account/utils';
import './account/accountLkInteractions.css';
import styles from './AccountPage.module.css';

const DEMO_BONUS = 1250;

export function AccountPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const section = resolveSection(params);
  const orderIdParam = params.get('orderId');

  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const logout = useAuthStore((s) => s.logout);
  const isCompactLk = useAccountMobileLayout();
  const addToCart = useCartStore((s) => s.addToCart);
  const openDrawer = useCartStore((s) => s.openDrawer);

  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [recommendations, setRecommendations] = useState<ProductListItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifSettings, setNotifSettings] = useState<NotificationSettings | null>(null);
  const [themeClass, setThemeClass] = useState<'theme-light' | 'theme-dark'>('theme-light');

  useEffect(() => {
    if (token) void fetchMe();
  }, [token, fetchMe]);

  useEffect(() => {
    const sync = () => {
      const dark = document.documentElement.getAttribute('data-theme') === 'dark';
      setThemeClass(dark ? 'theme-dark' : 'theme-light');
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const refreshNotifications = useCallback(() => {
    notificationsApi.list(1, 30).then((r) => setNotifications(r.items));
    notificationsApi.unreadCount().then((r) => setUnreadCount(r.count));
  }, []);

  useEffect(() => {
    if (!token) return;
    ordersApi.list(1, 50).then((r) => setOrders(r.items));
    favoritesApi.list().then(setFavorites);
    productsApi.list({ page: 1, limit: 8, sort: 'popular' }).then((r) => setRecommendations(r.items));
    refreshNotifications();
  }, [token, refreshNotifications]);

  useEffect(() => {
    if (!token) return;
    if (section === 'notifications') refreshNotifications();
    if (section === 'profile') notificationsApi.getSettings().then(setNotifSettings);
  }, [token, section, refreshNotifications]);

  const navigateSection = (id: AccountSection, extra?: { orderId?: string }) => {
    const next = new URLSearchParams();
    next.set('section', id);
    if (extra?.orderId) next.set('orderId', extra.orderId);
    setParams(next);
  };

  const openSupport = (orderId?: string) => {
    navigateSection('support', orderId ? { orderId } : undefined);
  };

  const openOrder = (id: string) => {
    const next = new URLSearchParams();
    next.set('section', 'orders');
    next.set('orderId', id);
    setParams(next);
  };

  const updateOrderInState = (updated: Order) => {
    setOrders((list) => list.map((o) => (o.id === updated.id ? updated : o)));
  };

  const handleAddProductToCart = async (product: ProductListItem) => {
    try {
      const detail = await productsApi.get(product.id);
      const variant = detail.variants.find((v) => v.isDefault) ?? detail.variants[0];
      if (!variant) return;
      await addToCart(variant.id, 1, snapshotFromDetail(detail, variant));
      if (!token) openDrawer();
    } catch {
      /* ignore */
    }
  };

  const handleRepeatOrder = async (order: Order) => {
    const withVariants = order.items.filter((i) => i.variantId);
    if (withVariants.length === 0) {
      navigate('/catalog');
      return;
    }
    try {
      for (const item of withVariants) {
        if (item.variantId) await addToCart(item.variantId, item.quantity);
      }
      navigate('/cart');
    } catch {
      navigate('/catalog');
    }
  };

  const displayName =
    user?.profile?.name?.trim() ||
    user?.email?.split('@')[0] ||
    'Покупатель';

  if (!token) {
    const returnUrl = `/account${params.toString() ? `?${params.toString()}` : ''}`;
    return <Navigate to={`/auth?returnUrl=${encodeURIComponent(returnUrl)}`} replace />;
  }

  const sectionTitle = SECTION_TITLES[section] ?? 'Личный кабинет';
  const hideOrdersMobileChrome = isCompactLk && section === 'orders';
  const hideSupportMobileChrome = isCompactLk && section === 'support';
  const hideSectionMobileChrome = hideOrdersMobileChrome || hideSupportMobileChrome;
  const showSectionHeading =
    section !== 'dashboard' && section !== 'favorites' && !hideSectionMobileChrome;
  const showMobileProfileBar = isCompactLk && section !== 'favorites' && !hideSectionMobileChrome;

  return (
    <AccountLayout
      themeClass={themeClass}
      sidebar={
        <AccountSidebar
          section={section}
          unreadCount={unreadCount}
          userEmail={user?.email ?? undefined}
          isSeller={user?.role === 'SELLER'}
          onNavigate={navigateSection}
          onLogout={logout}
        />
      }
    >
      <div className={styles.content}>
        {showMobileProfileBar && (
          <AccountProfileBar
            displayName={displayName}
            avatarUrl={user?.profile?.avatarUrl}
            onLogout={logout}
          />
        )}
        {showSectionHeading && (
          <header className={styles.sectionHead}>
            <button
              type="button"
              className={styles.backBtn}
              aria-label="На главную личного кабинета"
              onClick={() => navigateSection('dashboard')}
            >
              ‹
            </button>
            <h1 className={styles.sectionTitle}>{sectionTitle}</h1>
          </header>
        )}

        <div className={styles.view} key={section}>
          {section === 'dashboard' && (
            <>
              <AccountDashboard
                displayName={displayName}
                avatarUrl={user?.profile?.avatarUrl}
                orders={orders}
                recommendations={recommendations}
                onOpenOrder={openOrder}
                onAllOrders={() => navigateSection('orders')}
                onNavigateSection={navigateSection}
                onAddToCart={handleAddProductToCart}
              />
            </>
          )}

          {section === 'orders' && (
            <AccountOrders
              orders={orders}
              onOrderUpdated={updateOrderInState}
              onRepeat={handleRepeatOrder}
              onSupport={openSupport}
              onOpenOrder={openOrder}
              onBack={() => navigateSection('dashboard')}
              initialExpandedId={orderIdParam}
            />
          )}

          {section === 'favorites' && (
            <AccountFavorites
              favorites={favorites}
              recommendations={recommendations}
              onAddToCart={handleAddProductToCart}
              onFavoritesChange={setFavorites}
            />
          )}

          {section === 'notifications' && (
            <AccountNotifications
              notifications={notifications}
              onRefresh={refreshNotifications}
              onOpenOrder={openOrder}
              onGoOrders={() => navigateSection('orders')}
            />
          )}

          {section === 'profile' && (
            <AccountProfile
              user={user}
              notifSettings={notifSettings}
              onSettingsChange={setNotifSettings}
              onProfileSaved={fetchMe}
            />
          )}

          {section === 'returns' && (
            <AccountPlaceholder
              title="Возвраты"
              description="Оформление возврата доступно для доставленных заказов в течение 14 дней."
              actionLabel="К заказам"
              onAction={() => navigateSection('orders')}
            />
          )}

          {section === 'addresses' && (
            <AccountPlaceholder
              title="Адреса доставки"
              description="Сохранённые адреса подставляются при оформлении заказа в корзине."
              actionLabel="В корзину"
              onAction={() => navigate('/cart')}
            />
          )}

          {section === 'payments' && (
            <AccountPlaceholder
              title="Способы оплаты"
              description="Привязка карт и СБП будет доступна после подключения платёжного шлюза."
            />
          )}

          {section === 'finance' && (
            <div className={styles.financeCard}>
              <p className={styles.bonusValue}>{DEMO_BONUS.toLocaleString('ru-RU')}</p>
              <p className={styles.bonusHint}>бонусов на счёте</p>
              <p className={styles.financeNote}>
                1 бонус = 1 ₽ при оплате до 30% заказа. Бонусы начисляются после доставки.
              </p>
            </div>
          )}

          {section === 'support' && (
            <AccountSupport
              orders={orders}
              contextOrderId={orderIdParam}
              isSeller={user?.role === 'SELLER'}
              onNavigateSection={(id) => navigateSection(id)}
              onOpenOrder={openOrder}
              onBack={() => navigateSection('dashboard')}
            />
          )}
        </div>
      </div>
    </AccountLayout>
  );
}
