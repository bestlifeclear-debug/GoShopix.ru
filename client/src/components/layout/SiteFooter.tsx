import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './SiteFooter.module.css';

const PAYMENT_ICONS = [
  { id: 'yookassa', label: 'ЮKassa', src: '/payment-icons/yookassa.png' },
  { id: 'mir', label: 'Мир', src: '/payment-icons/mir.png' },
  { id: 'sbp', label: 'СБП', src: '/payment-icons/sbp.png' },
] as const;

const SOCIAL_LINKS = [
  {
    id: 'vk',
    label: 'Мы в VK',
    href: 'https://vk.com/goshopix',
    icon: '/footer-icons/vk.jpg',
  },
  {
    id: 'max',
    label: 'Мы в MAX',
    href: 'https://max.ru/join/6-tKaVQcvgWwgs8IYhY-DcgkIjJzsoJIJOXZ7a4GI6w',
    icon: '/footer-icons/max.jpg',
  },
] as const;

function useMinWidth(query: string) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    setMatches(mq.matches);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  const isDesktop = useMinWidth('(min-width: 768px)');

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.columns}>
          <div className={`${styles.col} ${styles.brandCol}`}>
            <Link to="/" className={styles.logo} aria-label="GoShopix — на главную">
              <span className={styles.logoMark}>G</span>
              <span className={styles.logoText}>GoShopix</span>
            </Link>
            <p className={styles.tagline}>
              Маркетплейс с тысячами товаров, быстрой доставкой и защитой покупателя.
            </p>
          </div>

          <details className={`${styles.col} ${styles.accordion}`} open={isDesktop || undefined}>
            <summary className={styles.colTitle}>Покупателям</summary>
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
          </details>

          <details className={`${styles.col} ${styles.accordion}`} open={isDesktop || undefined}>
            <summary className={styles.colTitle}>О компании</summary>
            <ul className={styles.links}>
              <li>
                <Link to="/auth?returnUrl=/seller/dashboard">Стать продавцом</Link>
              </li>
              <li>
                <Link to="/privacy">Конфиденциальность</Link>
              </li>
              <li>
                <Link to="/about">О нас</Link>
              </li>
            </ul>
          </details>

          <details
            className={`${styles.col} ${styles.accordion} ${styles.contactsCol}`}
            open={isDesktop || undefined}
          >
            <summary className={styles.colTitle}>Контакты</summary>
            <ul className={styles.contactList}>
              <li>
                <Link to="/account?section=support" className={styles.contactLink}>
                  Поддержка
                </Link>
              </li>
              <li>
                <a href="mailto:support@goshopix.ru" className={styles.emailLink}>
                  support@goshopix.ru
                </a>
              </li>
            </ul>
            <ul className={styles.socialList} aria-label="Социальные сети">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.id}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={styles.socialLink}
                    aria-label={social.label}
                  >
                    <img src={social.icon} alt="" className={styles.socialIcon} width={28} height={28} />
                    <span>{social.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </div>

        <div className={styles.bottom}>
          <small className={styles.copy}>© {year} GoShopix</small>
          <ul className={styles.payments} aria-label="Способы оплаты">
            {PAYMENT_ICONS.map((method) => (
              <li key={method.id}>
                <img
                  src={method.src}
                  alt={method.label}
                  className={`${styles.paymentIcon} ${method.id === 'mir' ? styles.paymentIconMir : ''}`}
                  width={method.id === 'mir' ? 96 : 88}
                  height={method.id === 'mir' ? 40 : 38}
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
