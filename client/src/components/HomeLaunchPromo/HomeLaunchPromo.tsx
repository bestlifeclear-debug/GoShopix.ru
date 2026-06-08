import { Link } from 'react-router-dom';
import { Store } from 'lucide-react';
import styles from './HomeLaunchPromo.module.css';

const SELLER_ENTRY = '/auth?returnUrl=/seller/dashboard';

export function HomeLaunchPromo() {
  return (
    <aside className={styles.banner} aria-label="GoShopix — запуск маркетплейса">
      <div className={styles.iconWrap} aria-hidden>
        <Store size={22} strokeWidth={2.25} />
      </div>

      <div className={styles.content}>
        <span className={styles.badge}>Мы открылись</span>
        <p className={styles.title}>Новый маркетплейс — набираем продавцов</p>
        <p className={styles.text}>
          Расширяем каталог каждый день. Подключайтесь на старте — тариф&nbsp;0&nbsp;₽/мес, комиссия 6%.
        </p>
      </div>

      <div className={styles.actions}>
        <Link to={SELLER_ENTRY} className={styles.cta}>
          Стать продавцом
        </Link>
        <Link to="/about" className={styles.link}>
          О GoShopix
        </Link>
      </div>
    </aside>
  );
}
