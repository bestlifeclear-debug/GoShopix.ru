import { useEffect, useMemo, useState } from 'react';
import type { NotificationSettings, User } from '../../api/types';
import { authApi, notificationsApi } from '../../api/index';
import { mapApiError } from '../../api/mapApiError';
import { showInfoToast } from '../../stores/toastStore';
import { validateEmail, validateIdentifier, validateOtpCode } from '../../utils/authValidation';
import { ProfileMobileToolbar } from './ProfileMobileToolbar';
import { useAccountMobileLayout } from './useAccountMobileLayout';
import styles from './AccountProfile.module.css';

interface AccountProfileProps {
  user: User | null;
  notifSettings: NotificationSettings | null;
  onSettingsChange: (s: NotificationSettings) => void;
  onProfileSaved: () => void;
  onBack?: () => void;
}

type ContactField = 'phone' | 'email';

type ChangeStep = 'value' | 'otp';

export function AccountProfile({
  user,
  notifSettings,
  onSettingsChange,
  onProfileSaved,
  onBack,
}: AccountProfileProps) {
  const isCompactMobile = useAccountMobileLayout();
  const [name, setName] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [notifSaving, setNotifSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileSuccessFade, setProfileSuccessFade] = useState(false);

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
      setProfileSuccessFade(false);
      setProfileSuccess(true);
      showInfoToast('Данные сохранены');
      window.setTimeout(() => setProfileSuccessFade(true), 2500);
      window.setTimeout(() => {
        setProfileSuccess(false);
        setProfileSuccessFade(false);
      }, 3000);
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
    <div className={styles.root}>
      {isCompactMobile ? <ProfileMobileToolbar onBack={onBack} /> : null}

      {!isCompactMobile ? (
        <header className={styles.desktopHead}>
          <h1 className={styles.desktopTitle}>Личные данные</h1>
          <p className={styles.desktopLead}>
            Имя, телефон и email используются при оформлении заказа и для входа на сайт.
          </p>
        </header>
      ) : (
        <p className={styles.hint}>
          Имя, телефон и email используются при оформлении заказа и для входа на сайт.
        </p>
      )}

      <section className={styles.card} aria-labelledby="profile-contact-title">
        <h2 id="profile-contact-title" className={`${styles.cardTitle} ${styles.cardTitleSection}`}>
          Контакты
        </h2>

        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            void saveProfile();
          }}
        >
          <div className={styles.field}>
            <label htmlFor="profile-name" className={styles.label}>
              Имя (необязательно)
            </label>
            <input
              id="profile-name"
              name="name"
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Как к вам обращаться"
              autoComplete="name"
            />
            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={profileSaving || !nameDirty}
            >
              {profileSaving ? 'Сохранение…' : 'Сохранить имя'}
            </button>
            {profileError ? (
              <p className={styles.formError} role="alert">
                {profileError}
              </p>
            ) : null}
            {profileSuccess && !profileError ? (
              <p
                className={`${styles.formSuccess} transition-opacity duration-500 ${
                  profileSuccessFade ? 'opacity-0' : 'opacity-100'
                }`}
                role="status"
              >
                Изменения сохранены
              </p>
            ) : null}
          </div>

          <hr className={styles.divider} />

          <div className={styles.field}>
            <span className={styles.label}>Телефон</span>
            <div className={styles.contactWrap}>
              <input
                type="text"
                readOnly
                disabled
                className={styles.inputReadonly}
                value={user?.profile?.phone ?? '—'}
                aria-readonly="true"
              />
              <button type="button" className={styles.changeBtn} onClick={() => openChange('phone')}>
                Изменить
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Email</span>
            <div className={styles.contactWrap}>
              <input
                type="text"
                readOnly
                disabled
                className={styles.inputReadonly}
                value={user?.email ?? '—'}
                aria-readonly="true"
              />
              <button type="button" className={styles.changeBtn} onClick={() => openChange('email')}>
                Изменить
              </button>
            </div>
          </div>
        </form>
      </section>

      {changeField ? (
        <div className={styles.modalBackdrop} role="presentation" onClick={closeChange}>
          <div
            className={styles.modal}
            role="dialog"
            aria-labelledby="change-contact-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="change-contact-title" className={styles.modalTitle}>
              {changeField === 'phone' ? 'Новый телефон' : 'Новый email'}
            </h3>
            {changeStep === 'value' ? (
              <>
                <div className={styles.field}>
                  <label htmlFor="change-contact-value" className={styles.label}>
                    {changeField === 'phone' ? 'Телефон' : 'Email'}
                  </label>
                  <input
                    id="change-contact-value"
                    type="text"
                    className={`${styles.input}${changeValueError ? ` ${styles.inputError}` : ''}`}
                    value={changeValue}
                    onChange={(e) => setChangeValue(e.target.value)}
                    autoComplete={changeField === 'phone' ? 'tel' : 'email'}
                  />
                  {changeValueError ? (
                    <p className={styles.formError} role="alert">
                      {changeValueError}
                    </p>
                  ) : null}
                </div>
                {changeError ? <p className={styles.formError}>{changeError}</p> : null}
                <div className={styles.modalActions}>
                  <button type="button" className={styles.secondaryBtn} onClick={closeChange}>
                    Отмена
                  </button>
                  <button
                    type="button"
                    className={styles.primaryBtn}
                    disabled={changeLoading}
                    onClick={() => void sendChangeOtp()}
                  >
                    {changeLoading ? 'Отправка…' : 'Отправить код'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className={styles.modalHint}>Код отправлен на {changeMasked}</p>
                {changeDevCode ? (
                  <p className={styles.devCode}>
                    Код (dev): <code>{changeDevCode}</code>
                  </p>
                ) : null}
                <div className={styles.field}>
                  <label htmlFor="change-contact-otp" className={styles.label}>
                    Код подтверждения
                  </label>
                  <input
                    id="change-contact-otp"
                    type="text"
                    inputMode="numeric"
                    className={`${styles.otpInput}${changeCodeError ? ` ${styles.inputError}` : ''}`}
                    value={changeCode}
                    onChange={(e) => setChangeCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    autoComplete="one-time-code"
                  />
                  {changeCodeError ? (
                    <p className={styles.formError} role="alert">
                      {changeCodeError}
                    </p>
                  ) : null}
                </div>
                {changeError ? <p className={styles.formError}>{changeError}</p> : null}
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => setChangeStep('value')}
                  >
                    Назад
                  </button>
                  <button
                    type="button"
                    className={styles.primaryBtn}
                    disabled={changeLoading}
                    onClick={() => void confirmChange()}
                  >
                    {changeLoading ? 'Проверка…' : 'Подтвердить'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      {notifSettings ? (
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
                <span>
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
                <span>
                  <span className={styles.notifOptionTitle}>В личном кабинете</span>
                  <span className={styles.notifOptionDesc}>Раздел «Уведомления» на сайте</span>
                </span>
              </label>
            </li>
          </ul>

          <button
            type="button"
            className={`${styles.primaryBtn} ${styles.notifActions}`}
            disabled={notifSaving}
            onClick={() => void saveNotifSettings()}
          >
            {notifSaving ? 'Сохранение…' : 'Сохранить настройки'}
          </button>
        </section>
      ) : null}
    </div>
  );
}
