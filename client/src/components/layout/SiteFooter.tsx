import { Link } from 'react-router-dom';
import styles from './SiteFooter.module.css';

const PAYMENT_ICONS = [
  { id: 'mir', label: 'Мир', src: '/payment-icons/mir.png' },
  { id: 'mastercard', label: 'Mastercard', src: '/payment-icons/mastercard.png' },
  { id: 'yookassa', label: 'ЮKassa', src: '/payment-icons/yookassa.png' },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.columns}>
          <div className={styles.col}>
            <p className={styles.brand}>GoShopix</p>
            <p className={styles.tagline}>
              Маркетплейс с тысячами товаров, быстрой доставкой и защитой покупателя.
            </p>
            <p className={styles.contact}>
              <a href="tel:+78001234567">8 800 123-45-67</a>
              <br />
              <a href="mailto:support@goshopix.ru">support@goshopix.ru</a>
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
                <Link to="/cart">Корзина</Link>
              </li>
            </ul>
          </div>

          <div className={styles.col}>
            <h3 className={styles.colTitle}>О компании</h3>
            <ul className={styles.links}>
              <li>
                <span>О GoShopix</span>
              </li>
              <li>
                <span>Вакансии</span>
              </li>
              <li>
                <Link to="/seller/dashboard">Продавцам</Link>
              </li>
            </ul>
          </div>

          <div className={styles.col}>
            <h3 className={styles.colTitle}>Контакты</h3>
            <ul className={styles.links}>
              <li>
                <a href="tel:+78001234567">8 800 123-45-67</a>
              </li>
              <li>
                <a href="mailto:support@goshopix.ru">support@goshopix.ru</a>
              </li>
              <li>
                <span>Пн–Вс, 9:00–21:00</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <small>© {year} GoShopix</small>
          <ul className={styles.payments} aria-label="Способы оплаты">
            {PAYMENT_ICONS.map((method) => (
              <li key={method.id}>
                <span className={styles.paymentBadge}>
                  <img
                    src={method.src}
                    alt={method.label}
                    className={styles.paymentIcon}
                    width={72}
                    height={32}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
              </li>
            ))}
          </ul>
          <div className={styles.social} aria-label="Соцсети">
            <a href="https://t.me" target="_blank" rel="noreferrer noopener">
              Telegram
            </a>
            <a href="https://vk.com" target="_blank" rel="noreferrer noopener">
              VK
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
