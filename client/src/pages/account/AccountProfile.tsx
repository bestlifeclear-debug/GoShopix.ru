import { Link } from 'react-router-dom';
import type { NotificationSettings, User } from '../../api/types';
import { notificationsApi } from '../../api/index';
import { Button } from '../../design-system';
import styles from '../AccountPage.module.css';

interface AccountProfileProps {
  user: User | null;
  notifSettings: NotificationSettings | null;
  onSettingsChange: (s: NotificationSettings) => void;
}

export function AccountProfile({ user, notifSettings, onSettingsChange }: AccountProfileProps) {
  return (
    <div className={styles.profileGrid}>
      <section className={styles.profileCard}>
        <h2 className={styles.profileCardTitle}>Контактные данные</h2>
        <dl className={styles.profileDl}>
          <div>
            <dt>Email</dt>
            <dd>{user?.email ?? '—'}</dd>
          </div>
          <div>
            <dt>Логин</dt>
            <dd>{user?.profile?.username ?? '—'}</dd>
          </div>
          <div>
            <dt>Имя</dt>
            <dd>
              {[user?.profile?.firstName, user?.profile?.lastName].filter(Boolean).join(' ') || '—'}
            </dd>
          </div>
          <div>
            <dt>Телефон</dt>
            <dd>{user?.profile?.phone ?? '—'}</dd>
          </div>
        </dl>
      </section>

      {notifSettings && (
        <section className={styles.profileCard}>
          <h2 className={styles.profileCardTitle}>Уведомления о заказах</h2>
          <fieldset className={styles.notifFieldset}>
            <label>
              <input
                type="checkbox"
                checked={notifSettings.emailOrderStatus}
                onChange={(e) =>
                  onSettingsChange({ ...notifSettings, emailOrderStatus: e.target.checked })
                }
              />{' '}
              Email при смене статуса
            </label>
            <label>
              <input
                type="checkbox"
                checked={notifSettings.inAppOrderStatus}
                onChange={(e) =>
                  onSettingsChange({ ...notifSettings, inAppOrderStatus: e.target.checked })
                }
              />{' '}
              In-app уведомления
            </label>
            <Button
              size="sm"
              onClick={() => notificationsApi.updateSettings(notifSettings).then(onSettingsChange)}
            >
              Сохранить
            </Button>
          </fieldset>
        </section>
      )}

      <Link to="/cart">
        <Button variant="outline">Перейти в корзину</Button>
      </Link>
    </div>
  );
}
