import { useEffect, useMemo, useState } from 'react';
import type { NotificationSettings, User } from '../../api/types';
import { authApi, notificationsApi } from '../../api/index';
import { Button, Input } from '../../design-system';
import { mapApiError } from '../../api/mapApiError';
import { showInfoToast } from '../../stores/toastStore';
import { validateEmail, validateIdentifier, validateOtpCode } from '../../utils/authValidation';
import styles from './AccountProfile.module.css';

interface AccountProfileProps {
  user: User | null;
  notifSettings: NotificationSettings | null;
  onSettingsChange: (s: NotificationSettings) => void;
  onProfileSaved: () => void;
}

type ContactField = 'phone' | 'email';

type ChangeStep = 'value' | 'otp';

export function AccountProfile({
  user,
  notifSettings,
  onSettingsChange,
  onProfileSaved,
}: AccountProfileProps) {
  const [name, setName] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [notifSaving, setNotifSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [changeField, setChangeField] = useState<ContactField | null>(null);
  const [changeStep, setChangeStep] = useState<ChangeStep>('value');
  const [changeValue, setChangeValue] = useState('');
  const [changeCode, setChangeCode] = useState('');
  const [changeMasked, setChangeMasked] = useState('');
  const [changeDevCode, setChangeDevCode] = useState<string | null>(null);
  const [changeLoading, setChangeLoading] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);
  const [changeSubmitted, setChangeSubmitted] = useState(false);

  useEffect(() => {
    setName(user?.profile?.name ?? '');
  }, [user]);

  const initialName = user?.profile?.name ?? '';
  const nameDirty = name.trim() !== initialName.trim();

  const saveProfile = async () => {
    setProfileError(null);
    setProfileSuccess(false);
    setProfileSaving(true);
    try {
      await authApi.updateProfile({ name: name.trim() });
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

  const openChange = (field: ContactField) => {
    setChangeField(field);
    setChangeStep('value');
    setChangeValue('');
    setChangeCode('');
    setChangeMasked('');
    setChangeDevCode(null);
    setChangeError(null);
    setChangeSubmitted(false);
  };

  const closeChange = () => {
    setChangeField(null);
    setChangeError(null);
  };

  const sendChangeOtp = async () => {
    setChangeSubmitted(true);
    setChangeError(null);
    const err =
      changeField === 'email' ? validateEmail(changeValue) : validateIdentifier(changeValue);
    if (err) return;

    setChangeLoading(true);
    try {
      const res =
        changeField === 'phone'
          ? await authApi.sendPhoneChangeOtp(changeValue.trim())
          : await authApi.sendEmailChangeOtp(changeValue.trim());
      setChangeMasked(res.maskedDestination);
      if (res.devCode) setChangeDevCode(res.devCode);
      setChangeStep('otp');
      setChangeSubmitted(false);
    } catch (e) {
      setChangeError(mapApiError(e, 'Не удалось отправить код'));
    } finally {
      setChangeLoading(false);
    }
  };

  const confirmChange = async () => {
    setChangeSubmitted(true);
    setChangeError(null);
    if (validateOtpCode(changeCode)) return;

    setChangeLoading(true);
    try {
      if (changeField === 'phone') {
        await authApi.verifyPhoneChange(changeValue.trim(), changeCode.trim());
      } else {
        await authApi.verifyEmailChange(changeValue.trim(), changeCode.trim());
      }
      await onProfileSaved();
      showInfoToast(changeField === 'phone' ? 'Телефон обновлён' : 'Email обновлён');
      closeChange();
    } catch (e) {
      setChangeError(mapApiError(e, 'Не удалось подтвердить'));
    } finally {
      setChangeLoading(false);
    }
  };

  const changeValueError = useMemo(() => {
    if (!changeSubmitted || changeStep !== 'value') return undefined;
    return changeField === 'email'
      ? validateEmail(changeValue)
      : validateIdentifier(changeValue);
  }, [changeSubmitted, changeStep, changeField, changeValue]);

  const changeCodeError =
    changeSubmitted && changeStep === 'otp' ? validateOtpCode(changeCode) : undefined;

  return (
    <div className={styles.wrap}>
      <section className={styles.card} aria-labelledby="profile-contact-title">
        <h2 id="profile-contact-title" className={styles.cardTitle}>
          Личные данные
        </h2>
        <p className={styles.cardHint}>
          Имя, телефон и email используются при оформлении заказа и для входа на сайт.
        </p>

        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            void saveProfile();
          }}
        >
          <Input
            label="Имя"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Как к вам обращаться"
            autoComplete="name"
            hint="Необязательно"
          />

          <div className={styles.contactRow}>
            <div className={styles.readonlyField}>
              <span className={styles.readonlyLabel}>Телефон</span>
              <p className={styles.readonlyValue}>{user?.profile?.phone ?? '—'}</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => openChange('phone')}>
              Изменить
            </Button>
          </div>

          <div className={styles.contactRow}>
            <div className={styles.readonlyField}>
              <span className={styles.readonlyLabel}>Email</span>
              <p className={styles.readonlyValue}>{user?.email ?? '—'}</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => openChange('email')}>
              Изменить
            </Button>
          </div>

          <div className={styles.formActions}>
            <Button type="submit" disabled={profileSaving || !nameDirty}>
              {profileSaving ? 'Сохранение…' : 'Сохранить имя'}
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

      {changeField && (
        <div className={styles.modalBackdrop} role="presentation" onClick={closeChange}>
          <div
            className={styles.modal}
            role="dialog"
            aria-labelledby="change-contact-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="change-contact-title" className={styles.cardTitle}>
              {changeField === 'phone' ? 'Новый телефон' : 'Новый email'}
            </h3>
            {changeStep === 'value' ? (
              <>
                <Input
                  label={changeField === 'phone' ? 'Телефон' : 'Email'}
                  value={changeValue}
                  onChange={(e) => setChangeValue(e.target.value)}
                  error={changeValueError}
                  autoComplete={changeField === 'phone' ? 'tel' : 'email'}
                  compact
                />
                {changeError && <p className={styles.formError}>{changeError}</p>}
                <div className={styles.modalActions}>
                  <Button variant="outline" onClick={closeChange}>
                    Отмена
                  </Button>
                  <Button loading={changeLoading} onClick={() => void sendChangeOtp()}>
                    Отправить код
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className={styles.cardHint}>Код отправлен на {changeMasked}</p>
                {changeDevCode && (
                  <p className={styles.cardHint}>
                    Код (dev): <code>{changeDevCode}</code>
                  </p>
                )}
                <Input
                  label="Код подтверждения"
                  inputMode="numeric"
                  value={changeCode}
                  onChange={(e) => setChangeCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  error={changeCodeError}
                  autoComplete="one-time-code"
                  compact
                />
                {changeError && <p className={styles.formError}>{changeError}</p>}
                <div className={styles.modalActions}>
                  <Button variant="outline" onClick={() => setChangeStep('value')}>
                    Назад
                  </Button>
                  <Button loading={changeLoading} onClick={() => void confirmChange()}>
                    Подтвердить
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

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
