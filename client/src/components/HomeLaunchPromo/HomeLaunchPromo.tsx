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
        <p className={styles.title}>
          <span className={styles.titleDesktop}>Новый маркетплейс, набираем продавцов</span>
          <span className={styles.titleMobile}>
            <span className={styles.titleLine}>Новый маркетплейс,</span>
            <span className={styles.titleLine}>набираем продавцов</span>
          </span>
        </p>
        <p className={styles.text}>
          <span className={styles.textLine}>Расширяем каталог каждый день.</span>
          <span className={styles.textDesktop}>
            Подключайтесь на старте, тариф&nbsp;0&nbsp;₽/мес, комиссия&nbsp;6%.
          </span>
          <span className={styles.textMobile}>
            <span className={styles.textLine}>Подключайтесь на старте,</span>
            <span className={styles.textLine}>тариф&nbsp;0&nbsp;₽/мес, комиссия&nbsp;6%.</span>
          </span>
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
