import { Headphones, ShieldCheck, Zap } from 'lucide-react';
import styles from './HomeWhyGoShopix.module.css';

const CARDS = [
  {
    id: 'sellers',
    title: 'Проверенные продавцы',
    text: 'Модерация магазинов и контроль качества товаров',
    Icon: ShieldCheck,
  },
  {
    id: 'delivery',
    title: 'Быстрая доставка',
    text: 'ПВЗ и курьер — отслеживание в личном кабинете',
    Icon: Zap,
  },
  {
    id: 'support',
    title: 'Поддержка 7 дней',
    text: 'Поможем с заказом, возвратом и оплатой',
    Icon: Headphones,
  },
] as const;

export function HomeWhyGoShopix() {
  return (
    <section className={styles.section} aria-labelledby="why-goshopix-title">
      <p id="why-goshopix-title" className={styles.title}>
        Почему GoShopix
      </p>
      <div className={styles.track}>
        {CARDS.map(({ id, title, text, Icon }) => (
          <article key={id} className={styles.card}>
            <span className={styles.cardIcon} aria-hidden>
              <Icon size={20} strokeWidth={2.25} />
            </span>
            <p className={styles.cardTitle}>{title}</p>
            <p className={styles.cardText}>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
