import styles from './TrustBar.module.css';

const ITEMS = [
  {
    title: 'Бесплатная доставка',
    text: 'При заказе от 2 000 ₽',
    icon: '🚚',
  },
  {
    title: 'Возврат 14 дней',
    text: 'Без лишних вопросов',
    icon: '↩',
  },
  {
    title: 'Оплата при получении',
    text: 'Картой или наличными',
    icon: '💳',
  },
  {
    title: 'Гарантии',
    text: 'Защита покупателя',
    icon: '🛡',
  },
] as const;

export function TrustBar() {
  return (
    <section className={styles.bar} aria-label="Преимущества маркетплейса">
      <ul className={styles.list}>
        {ITEMS.map((item) => (
          <li key={item.title} className={styles.item}>
            <span className={styles.icon} aria-hidden>
              {item.icon}
            </span>
            <div className={styles.text}>
              <strong className={styles.title}>{item.title}</strong>
              <span className={styles.sub}>{item.text}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
