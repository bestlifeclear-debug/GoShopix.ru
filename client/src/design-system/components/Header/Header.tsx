import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IconCart, IconCatalog, IconClose, IconHeart, IconMenu, IconUser } from '../../icons/Icons';
import styles from './Header.module.css';

export interface HeaderNavLink {
  label: string;
  to: string;
}

export interface HeaderProps {
  cartCount?: number;
  searchSlot?: ReactNode;
  deliverySlot?: ReactNode;
  catalogMenu?: ReactNode;
  catalogOpen?: boolean;
  onCatalogToggle?: () => void;
  onCatalogMouseEnter?: () => void;
  onCatalogMouseLeave?: () => void;
  onCartClick?: () => void;
  favoritesTo?: string;
  accountTo?: string;
  accountLabel?: string;
  navLinks?: HeaderNavLink[];
  menuOpen?: boolean;
  onMenuToggle?: () => void;
  extraActions?: ReactNode;
}

export function Header({
  cartCount = 0,
  searchSlot,
  deliverySlot,
  catalogMenu: _catalogMenu,
  catalogOpen = false,
  onCatalogToggle,
  onCatalogMouseEnter,
  onCatalogMouseLeave,
  onCartClick,
  favoritesTo = '/account?section=favorites',
  accountTo = '/account',
  accountLabel = 'Личный кабинет',
  navLinks = [],
  menuOpen = false,
  onMenuToggle,
  extraActions,
}: HeaderProps) {
  const location = useLocation();
  const currentPath = `${location.pathname}${location.search}`;

  const isNavActive = (to: string) => {
    if (to === currentPath) return true;
    try {
      const target = new URL(to, window.location.origin);
      const current = new URL(currentPath, window.location.origin);
      if (target.pathname !== current.pathname) return false;
      for (const [key, val] of target.searchParams) {
        if (current.searchParams.get(key) !== val) return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  const showCatalog = Boolean(onCatalogToggle);

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <div className={`container ${styles.inner}`}>
          {onMenuToggle && (
            <button
              type="button"
              className={styles.menuBtn}
              onClick={onMenuToggle}
              aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <IconClose /> : <IconMenu />}
            </button>
          )}
          <Link to="/" className={styles.logo} aria-label="GoShopix — на главную">
            <span className={styles.logoMark}>G</span>
            <span className={styles.logoText}>GoShopix</span>
          </Link>
          <div className={styles.searchGroup}>{searchSlot}</div>
          <div className={styles.topActions}>
            {extraActions}
            <Link to={favoritesTo} className={styles.topIconBtn} aria-label="Избранное">
              <IconHeart className={styles.topActionIcon} strokeWidth={1.5} />
            </Link>
            <button
              type="button"
              className={styles.topIconBtn}
              onClick={onCartClick}
              aria-label={`Корзина, ${cartCount} товаров`}
            >
              <IconCart className={styles.topActionIcon} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className={styles.topCartBadge}>{cartCount > 99 ? '99+' : cartCount}</span>
              )}
            </button>
            <Link to={accountTo} className={styles.topIconBtn} aria-label={accountLabel}>
              <IconUser className={styles.topActionIcon} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </div>

      <nav className={styles.navBar} aria-label="Навигация магазина">
        <div className={`container ${styles.navInner}`}>
          <div className={styles.navLeft}>
            {showCatalog && (
              <div
                className={styles.catalogWrap}
                onMouseEnter={onCatalogMouseEnter}
                onMouseLeave={onCatalogMouseLeave}
              >
                <button
                  type="button"
                  className={`${styles.catalogBtn} ${catalogOpen ? styles.catalogBtnActive : ''}`}
                  onClick={onCatalogToggle}
                  aria-expanded={catalogOpen}
                  aria-haspopup="true"
                >
                  <span className={styles.catalogIcon} aria-hidden>
                    <IconCatalog />
                  </span>
                  <span className={styles.catalogLabel}>Каталог</span>
                </button>
              </div>
            )}
            {navLinks.length > 0 && (
              <div className={styles.navLinksGroup}>
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`${styles.navLink} ${isNavActive(link.to) ? styles.navLinkActive : ''}`}
                    aria-current={isNavActive(link.to) ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className={styles.navRight}>
            {deliverySlot ? <div className={styles.navDeliverySlot}>{deliverySlot}</div> : null}
          </div>
        </div>
      </nav>
    </header>
  );
}
