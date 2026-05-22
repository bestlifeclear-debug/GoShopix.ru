import { useEffect, useMemo, useState } from 'react';
import type { NotificationSettings, User } from '../../api/types';
import { authApi, notificationsApi } from '../../api/index';
import { Button, Input } from '../../design-system';
import { mapApiError } from '../../api/mapApiError';
import { showInfoToast } from '../../stores/toastStore';
import styles from './AccountProfile.module.css';

interface AccountProfileProps {
  user: User | null;
  notifSettings: NotificationSettings | null;
  onSettingsChange: (s: NotificationSettings) => void;
  onProfileSaved: () => void;
}

interface ProfileForm {
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
}

function toForm(user: User | null): ProfileForm {
  return {
    username: user?.profile?.username ?? '',
    firstName: user?.profile?.firstName ?? '',
    lastName: user?.profile?.lastName ?? '',
    phone: user?.profile?.phone ?? '',
  };
}

export function AccountProfile({
  user,
  notifSettings,
  onSettingsChange,
  onProfileSaved,
}: AccountProfileProps) {
  const [form, setForm] = useState<ProfileForm>(() => toForm(user));
  const [profileSaving, setProfileSaving] = useState(false);
  const [notifSaving, setNotifSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  useEffect(() => {
    setForm(toForm(user));
  }, [user]);

  const initialForm = useMemo(() => toForm(user), [user]);

  const profileDirty = useMemo(
    () =>
      form.username !== initialForm.username ||
      form.firstName !== initialForm.firstName ||
      form.lastName !== initialForm.lastName ||
      form.phone !== initialForm.phone,
    [form, initialForm],
  );

  const needsUsername = !user?.profile?.username;

  const saveProfile = async () => {
    setProfileError(null);
    setProfileSuccess(false);

    const username = form.username.trim();
    if (needsUsername && username.length < 3) {
      setProfileError('Укажите логин — от 3 символов, латиница, цифры и _');
      return;
    }

    setProfileSaving(true);
    try {
      await authApi.updateProfile({
        ...(username ? { username } : {}),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
      });
      await onProfileSaved();
      setProfileSuccess(true);
      showInfoToast('Данные сохранены');
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (e) {
      setProfileError(mapApiError(e, 'Не удалось сохранить'));
    } finally {
      setProfileSaving(false);
    }
  };

  const saveNotifSettings = async () => {
    if (!notifSettings) return;
    setNotifSaving(true);
    try {
      const updated = await notificationsApi.updateSettings(notifSettings);
      onSettingsChange(updated);
      showInfoToast('Настройки уведомлений сохранены');
    } catch (e) {
      showInfoToast(mapApiError(e, 'Не удалось сохранить настройки'));
    } finally {
      setNotifSaving(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <section className={styles.card} aria-labelledby="profile-contact-title">
        <h2 id="profile-contact-title" className={styles.cardTitle}>
          Контактные данные
        </h2>
        <p className={styles.cardHint}>
          Используются при оформлении заказа и для связи с вами. Email изменить можно через поддержку.
        </p>

        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            void saveProfile();
          }}
        >
          <div className={styles.readonlyField}>
            <span className={styles.readonlyLabel}>Email</span>
            <p className={styles.readonlyValue}>{user?.email ?? '—'}</p>
            <p className={styles.readonlyNote}>Привязан к аккаунту, не редактируется здесь</p>
          </div>

          <Input
            label="Логин"
            name="username"
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            placeholder="ivan_shop"
            hint="Латиница, цифры и подчёркивание. Для входа на сайт."
            autoComplete="username"
          />

          <div className={styles.nameRow}>
            <Input
              label="Имя"
              name="firstName"
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              placeholder="Алексей"
              autoComplete="given-name"
            />
            <Input
              label="Фамилия"
              name="lastName"
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              placeholder="Иванов"
              autoComplete="family-name"
            />
          </div>

          <Input
            label="Телефон"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="+7 (900) 000-00-00"
            hint="Для SMS о заказе и входа по номеру"
            autoComplete="tel"
          />

          <div className={styles.formActions}>
            <Button type="submit" disabled={profileSaving || !profileDirty}>
              {profileSaving ? 'Сохранение…' : 'Сохранить'}
            </Button>
            {profileError && (
              <p className={styles.formError} role="alert">
                {profileError}
              </p>
            )}
            {profileSuccess && !profileError && (
              <p className={styles.formSuccess}>Изменения сохранены</p>
            )}
          </div>
        </form>
      </section>

      {notifSettings && (
        <section className={styles.card} aria-labelledby="profile-notif-title">
          <h2 id="profile-notif-title" className={styles.cardTitle}>
            Уведомления о заказах
          </h2>
          <p className={styles.cardHint}>Выберите, как сообщать об изменении статуса заказа.</p>

          <ul className={styles.notifList}>
            <li>
              <label className={styles.notifOption}>
                <input
                  type="checkbox"
                  checked={notifSettings.emailOrderStatus}
                  onChange={(e) =>
                    onSettingsChange({ ...notifSettings, emailOrderStatus: e.target.checked })
                  }
                />
                <span className={styles.notifOptionText}>
                  <span className={styles.notifOptionTitle}>Email</span>
                  <span className={styles.notifOptionDesc}>Письмо при смене статуса заказа</span>
                </span>
              </label>
            </li>
            <li>
              <label className={styles.notifOption}>
                <input
                  type="checkbox"
                  checked={notifSettings.inAppOrderStatus}
                  onChange={(e) =>
                    onSettingsChange({ ...notifSettings, inAppOrderStatus: e.target.checked })
                  }
                />
                <span className={styles.notifOptionText}>
                  <span className={styles.notifOptionTitle}>В личном кабинете</span>
                  <span className={styles.notifOptionDesc}>Раздел «Уведомления» на сайте</span>
                </span>
              </label>
            </li>
          </ul>

          <div className={styles.formActions}>
            <Button
              variant="outline"
              size="sm"
              disabled={notifSaving}
              onClick={() => void saveNotifSettings()}
            >
              {notifSaving ? 'Сохранение…' : 'Сохранить настройки'}
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
