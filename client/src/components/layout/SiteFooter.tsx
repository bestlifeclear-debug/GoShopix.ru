import { Link } from 'react-router-dom';
import styles from './SiteFooter.module.css';

const TRUST = [
  { icon: '🚚', title: 'Доставка', text: 'Курьер и ПВЗ, от 1 дня' },
  { icon: '📦', title: 'Самовывоз', text: 'Пункты выдачи по России' },
  { icon: '💳', title: 'Оплата', text: 'Карта, СБП, при получении' },
  { icon: '🛡', title: 'Гарантии', text: 'Защита покупателя и возврат' },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.trustRow} aria-label="Преимущества">
        {TRUST.map((item) => (
          <div key={item.title} className={styles.trustCard}>
            <span className={styles.trustIcon} aria-hidden>
              {item.icon}
            </span>
            <div className={styles.trustText}>
              <strong>{item.title}</strong>
              <span>{item.text}</span>
            </div>
          </div>
        ))}
      </div>

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
          <div className={styles.payments} aria-label="Способы оплаты">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Мир</span>
            <span>СБП</span>
          </div>
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
