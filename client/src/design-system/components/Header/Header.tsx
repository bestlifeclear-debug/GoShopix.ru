import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { IconCart, IconCatalog, IconClose, IconHeart, IconMenu, IconUser } from '../../icons/Icons';
import styles from './Header.module.css';

export interface HeaderNavLink {
  label: string;
  to: string;
}

export interface HeaderProps {
  cartCount?: number;
  searchSlot?: ReactNode;
  catalogMenu?: ReactNode;
  catalogOpen?: boolean;
  onCatalogToggle?: () => void;
  onCartClick?: () => void;
  favoritesTo?: string;
  accountTo?: string;
  accountLabel?: string;
  navLinks?: HeaderNavLink[];
  menuOpen?: boolean;
  onMenuToggle?: () => void;
}

export function Header({
  cartCount = 0,
  searchSlot,
  catalogMenu,
  catalogOpen = false,
  onCatalogToggle,
  onCartClick,
  favoritesTo = '/account?tab=favorites',
  accountTo = '/account',
  accountLabel = 'Личный кабинет',
  navLinks = [],
  menuOpen = false,
  onMenuToggle,
}: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <div className={styles.inner}>
          <div className={styles.leftGroup}>
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
            <div className={styles.catalogWrap}>
              <button
                type="button"
                className={`${styles.catalogBtn} ${catalogOpen ? styles.catalogBtnActive : ''}`}
                onClick={onCatalogToggle}
                aria-expanded={catalogOpen}
                aria-haspopup="true"
              >
                <IconCatalog />
                <span className={styles.catalogLabel}>Каталог</span>
              </button>
              {catalogOpen && catalogMenu}
            </div>
          </div>

          <div className={styles.searchGroup}>{searchSlot}</div>

          <div className={styles.actions}>
            <Link to={favoritesTo} className={styles.iconBtn} aria-label="Избранное">
              <IconHeart />
            </Link>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={onCartClick}
              aria-label={`Корзина, ${cartCount} товаров`}
            >
              <IconCart />
              {cartCount > 0 && (
                <span className={styles.cartBadge}>{cartCount > 99 ? '99+' : cartCount}</span>
              )}
            </button>
            <Link to={accountTo} className={styles.iconBtn} aria-label={accountLabel}>
              <IconUser />
            </Link>
          </div>
        </div>
      </div>

      {navLinks.length > 0 && (
        <nav className={styles.navBar} aria-label="Разделы каталога">
          <div className={styles.navInner}>
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className={styles.navLink}>
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
