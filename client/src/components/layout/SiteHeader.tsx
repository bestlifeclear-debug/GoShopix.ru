import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { categoriesApi, productsApi } from '../../api/index';
import type { CategoryNode } from '../../api/types';
import { Header, type HeaderNavLink } from '../../design-system';
import { IconClose } from '../../design-system/icons/Icons';
import { CatalogMenu } from '../CatalogMenu/CatalogMenu';
import { SearchBox, type SearchSuggestion } from '../SearchBox/SearchBox';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import styles from './SiteHeader.module.css';

const CATEGORY_ICONS: Record<string, string> = {
  electronics: '📱',
  clothing: '👕',
  smartphones: '📱',
  laptops: '💻',
};

const STATIC_NAV: HeaderNavLink[] = [
  { label: 'Акции', to: '/catalog?sort=price_asc' },
  { label: 'Новинки', to: '/catalog?sort=newest' },
  { label: 'Бестселлеры', to: '/catalog?sort=popular' },
];

export function SiteHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const cartCount = useCartStore((s) => s.itemCount());
  const fetchCart = useCartStore((s) => s.fetchCart);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const initGuestCart = useCartStore((s) => s.initGuestCart);

  useEffect(() => {
    initGuestCart();
    void fetchCart();
  }, [token, fetchCart, initGuestCart]);

  const handleCartClick = () => {
    if (token) {
      navigate('/cart');
    } else {
      openDrawer();
    }
  };

  useEffect(() => {
    void categoriesApi.tree().then(setCategories);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setCatalogOpen(false);
    };
    if (catalogOpen) document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [catalogOpen]);

  useEffect(() => {
    const q = search.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = window.setTimeout(() => {
      void productsApi.list({ q, limit: 8 }).then((res) =>
        setSuggestions(
          res.items.map((p) => ({
            id: p.id,
            label: p.name,
            to: `/product/${p.id}`,
            meta: p.brand ?? p.category?.name,
          })),
        ),
      );
    }, 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  const navLinks = useMemo<HeaderNavLink[]>(() => {
    const fromCategories = categories
      .filter((c) => !c.parentId)
      .slice(0, 3)
      .map((c) => ({ label: c.name, to: `/catalog?categorySlug=${c.slug}` }));
    return [...fromCategories, ...STATIC_NAV].slice(0, 6);
  }, [categories]);

  const goSearch = () => {
    const q = search.trim();
    navigate(q ? `/catalog?q=${encodeURIComponent(q)}` : '/catalog');
    setMenuOpen(false);
    setCatalogOpen(false);
  };

  const sellerLink =
    user?.role === 'SELLER' ? (
      <Link to="/seller/dashboard" onClick={() => setMenuOpen(false)}>
        Кабинет продавца
      </Link>
    ) : null;

  return (
    <div ref={wrapRef} className={styles.wrap}>
      <Header
        searchSlot={
          <SearchBox
            value={search}
            onChange={setSearch}
            onSubmit={goSearch}
            suggestions={suggestions}
            hideSubmit
          />
        }
        catalogOpen={catalogOpen}
        onCatalogToggle={() => setCatalogOpen((o) => !o)}
        catalogMenu={
          <CatalogMenu categories={categories} onClose={() => setCatalogOpen(false)} />
        }
        extraActions={<ThemeToggle />}
        cartCount={cartCount}
        onCartClick={handleCartClick}
        favoritesTo={token ? '/account?section=favorites' : '/auth'}
        accountTo={token ? '/account?section=dashboard' : '/auth'}
        accountLabel={token ? 'Личный кабинет' : 'Войти'}
        navLinks={location.pathname.startsWith('/account') ? [] : navLinks}
        menuOpen={menuOpen}
        onMenuToggle={() => {
          setMenuOpen((o) => !o);
          setCatalogOpen(false);
        }}
      />

      {menuOpen && (
        <>
          <div className={styles.mobileOverlay} role="presentation" onClick={() => setMenuOpen(false)} />
          <nav className={styles.navMobile} aria-label="Мобильное меню">
            <div className={styles.menuHead}>
              <button
                type="button"
                className={styles.menuClose}
                onClick={() => setMenuOpen(false)}
                aria-label="Закрыть меню"
              >
                <IconClose />
              </button>
              <h2 className={styles.menuTitle}>Каталог</h2>
              <span style={{ width: 48 }} aria-hidden />
            </div>
            <div className={styles.menuBody}>
              <p className={styles.mobileSectionTitle}>Категории</p>
              {categories
                .filter((c) => !c.parentId)
                .map((cat) => (
                  <div key={cat.id}>
                    <Link
                      to={`/catalog?categorySlug=${cat.slug}`}
                      className={styles.mobileLink}
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className={styles.catIcon} aria-hidden>
                        {CATEGORY_ICONS[cat.slug] ?? '🛍'}
                      </span>
                      {cat.name}
                    </Link>
                    {cat.children.map((child) => (
                      <Link
                        key={child.id}
                        to={`/catalog?categorySlug=${child.slug}`}
                        className={styles.mobileLinkChild}
                        onClick={() => setMenuOpen(false)}
                      >
                        {child.name}
                      </Link>
                    ))}
                    <hr className={styles.menuDivider} />
                  </div>
                ))}
              <p className={styles.mobileSectionTitle}>Разделы</p>
              {STATIC_NAV.map((link) => (
                <Link key={link.to} to={link.to} className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                  {link.label}
                </Link>
              ))}
              <button
                type="button"
                className={styles.mobileLink}
                onClick={() => {
                  setMenuOpen(false);
                  handleCartClick();
                }}
              >
                Корзина{cartCount > 0 ? ` (${cartCount})` : ''}
              </button>
              {sellerLink}
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
