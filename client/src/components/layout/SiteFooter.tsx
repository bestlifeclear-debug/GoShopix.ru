import { Link } from 'react-router-dom';
import styles from './SiteFooter.module.css';

const PAYMENT_ICONS = [
  { id: 'yookassa', label: 'ЮKassa', src: '/payment-icons/yookassa.png' },
  { id: 'mir', label: 'Мир', src: '/payment-icons/mir.png' },
  { id: 'sbp', label: 'СБП', src: '/payment-icons/sbp.png' },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.columns}>
          <div className={styles.col}>
            <p className={styles.brand}>GoShopix</p>
            <p className={styles.tagline}>
              Маркетплейс с тысячами товаров, быстрой доставкой и защитой покупателя.
            </p>
          </div>

          <div className={styles.col}>
            <h3 className={styles.colTitle}>Покупателям</h3>
            <ul className={styles.links}>
              <li>
                <Link to="/catalog">Каталог</Link>
              </li>
              <li>
                <Link to="/catalog?sort=popular">Бестселлеры</Link>
              </li>
              <li>
                <Link to="/catalog?sort=newest">Новинки</Link>
              </li>
              <li>
                <a href="https://vk.com/goshopixowner" target="_blank" rel="noreferrer noopener">
                  Сотрудничество
                </a>
              </li>
            </ul>
          </div>

          <div className={styles.col}>
            <h3 className={styles.colTitle}>О компании</h3>
            <ul className={styles.links}>
              <li>
                <Link to="/privacy">Политика конфиденциальности</Link>
              </li>
              <li>
                <Link to="/about">О нас</Link>
              </li>
              <li>
                <a
                  href="https://vk.com/goshopix"
                  target="_blank"
                  rel="noreferrer noopener"
                  className={styles.linkWithIcon}
                >
                  <span>Мы в VK</span>
                  <span className={styles.iconWrap}>
                    <img src="/footer-icons/vk.jpg" alt="" className={styles.menuIcon} width={24} height={24} />
                  </span>
                </a>
              </li>
              <li>
                <span className={styles.linkWithIcon}>
                  <span>Мы в MAX</span>
                  <span className={styles.iconWrap}>
                    <img src="/footer-icons/max.jpg" alt="" className={styles.menuIcon} width={24} height={24} />
                  </span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <small>© {year} GoShopix</small>
          <ul className={styles.payments} aria-label="Способы оплаты">
            {PAYMENT_ICONS.map((method) => (
              <li key={method.id}>
                <img
                  src={method.src}
                  alt={method.label}
                  className={styles.paymentIcon}
                  width={80}
                  height={32}
                  loading="lazy"
                  decoding="async"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

