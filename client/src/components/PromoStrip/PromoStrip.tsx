import { Link } from 'react-router-dom';
import styles from './PromoStrip.module.css';

const ITEMS = [
  {
    id: 'deals',
    icon: '🔥',
    title: 'Выгодные предложения',
    text: 'Скидки до 50%',
    to: '/catalog?sort=price_asc',
    accent: true,
  },
  {
    id: 'new',
    icon: '✨',
    title: 'Новинки',
    text: 'Свежие поступления',
    to: '/catalog?sort=newest',
    accent: false,
  },
  {
    id: 'bestsellers',
    icon: '⭐',
    title: 'Бестселлеры',
    text: 'Хиты по отзывам',
    to: '/catalog?sort=popular',
    accent: false,
  },
  {
    id: 'delivery',
    icon: '🚚',
    title: 'Доставка 0 ₽',
    text: 'От 2 000 ₽',
    to: '/catalog',
    accent: false,
  },
] as const;

export function PromoStrip() {
  return (
    <section className={styles.strip} aria-label="Промо-разделы">
      <div className={styles.grid}>
        {ITEMS.map((item) => (
          <Link
            key={item.id}
            to={item.to}
            className={`${styles.card} ${item.accent ? styles.cardAccent : ''}`}
          >
            <span className={styles.icon} aria-hidden>
              {item.icon}
            </span>
            <span className={styles.title}>{item.title}</span>
            <span className={styles.text}>{item.text}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
