import { useEffect, useMemo, useState } from 'react';
import type { NotificationSettings, User } from '../../api/types';
import { authApi, notificationsApi } from '../../api/index';
import { mapApiError } from '../../api/mapApiError';
import { showInfoToast } from '../../stores/toastStore';
import { validateEmail, validateIdentifier, validateOtpCode } from '../../utils/authValidation';

interface AccountProfileProps {
  user: User | null;
  notifSettings: NotificationSettings | null;
  onSettingsChange: (s: NotificationSettings) => void;
  onProfileSaved: () => void;
}

type ContactField = 'phone' | 'email';

type ChangeStep = 'value' | 'otp';

const cardClass =
  'bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100/50';

const cardTitleClass = 'text-xl font-bold text-slate-800';

const cardHintClass = 'text-xs text-slate-400 mt-1 mb-6 block';

const labelClass = 'text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block';

const nameInputClass =
  'w-full max-w-md bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-base text-slate-800 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all';

const contactInputClass =
  'w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-base text-slate-500 pr-24';

const saveBtnClass =
  'bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors w-fit block disabled:opacity-60 disabled:pointer-events-none';

const changeBtnClass =
  'absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-red-500 hover:text-red-600 transition-colors bg-transparent';

const modalInputClass =
  'w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-base text-slate-800 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all';

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
    <div className="flex w-full max-w-3xl flex-col space-y-6">
      <section className={cardClass} aria-labelledby="profile-contact-title">
        <h2 id="profile-contact-title" className={cardTitleClass}>
          Личные данные
        </h2>
        <span className={cardHintClass}>
          Имя, телефон и email используются при оформлении заказа и для входа на сайт.
        </span>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void saveProfile();
          }}
        >
          <div className="mb-8">
            <label htmlFor="profile-name" className={labelClass}>
              Имя (необязательно)
            </label>
            <input
              id="profile-name"
              name="name"
              type="text"
              className={nameInputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Как к вам обращаться"
              autoComplete="name"
            />
            <button
              type="submit"
              className={`${saveBtnClass} mt-4`}
              disabled={profileSaving || !nameDirty}
            >
              {profileSaving ? 'Сохранение…' : 'Сохранить имя'}
            </button>
            {profileError && (
              <p className="mt-3 text-sm text-red-500" role="alert">
                {profileError}
              </p>
            )}
            {profileSuccess && !profileError && (
              <p
                className={`mt-3 flex items-center gap-1.5 text-sm text-emerald-600 transition-opacity duration-500 ${
                  profileSuccessFade ? 'opacity-0' : 'opacity-100'
                }`}
                role="status"
              >
                <svg
                  className="h-4 w-4 shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clipRule="evenodd"
                  />
                </svg>
                Изменения сохранены
              </p>
            )}
          </div>

          <div className="flex flex-col space-y-5">
            <div>
              <span className={labelClass}>Телефон</span>
              <div className="relative max-w-md">
                <input
                  type="text"
                  readOnly
                  disabled
                  className={contactInputClass}
                  value={user?.profile?.phone ?? '—'}
                  aria-readonly="true"
                />
                <button type="button" className={changeBtnClass} onClick={() => openChange('phone')}>
                  Изменить
                </button>
              </div>
            </div>

            <div>
              <span className={labelClass}>Email</span>
              <div className="relative max-w-md">
                <input
                  type="text"
                  readOnly
                  disabled
                  className={contactInputClass}
                  value={user?.email ?? '—'}
                  aria-readonly="true"
                />
                <button type="button" className={changeBtnClass} onClick={() => openChange('email')}>
                  Изменить
                </button>
              </div>
            </div>
          </div>
        </form>
      </section>

      {changeField && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 p-4"
          role="presentation"
          onClick={closeChange}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-100/50 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
            role="dialog"
            aria-labelledby="change-contact-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="change-contact-title" className={cardTitleClass}>
              {changeField === 'phone' ? 'Новый телефон' : 'Новый email'}
            </h3>
            {changeStep === 'value' ? (
              <>
                <div className="mt-4">
                  <label htmlFor="change-contact-value" className={labelClass}>
                    {changeField === 'phone' ? 'Телефон' : 'Email'}
                  </label>
                  <input
                    id="change-contact-value"
                    type="text"
                    className={`${modalInputClass}${changeValueError ? ' border-red-400' : ''}`}
                    value={changeValue}
                    onChange={(e) => setChangeValue(e.target.value)}
                    autoComplete={changeField === 'phone' ? 'tel' : 'email'}
                  />
                  {changeValueError && (
                    <p className="mt-1.5 text-sm text-red-500" role="alert">
                      {changeValueError}
                    </p>
                  )}
                </div>
                {changeError && <p className="mt-3 text-sm text-red-500">{changeError}</p>}
                <div className="mt-6 flex flex-wrap justify-end gap-2.5">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                    onClick={closeChange}
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    className={`${saveBtnClass} inline-block`}
                    disabled={changeLoading}
                    onClick={() => void sendChangeOtp()}
                  >
                    {changeLoading ? 'Отправка…' : 'Отправить код'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className={`${cardHintClass} mb-4`}>Код отправлен на {changeMasked}</p>
                {changeDevCode && (
                  <p className="mb-4 text-xs text-slate-400">
                    Код (dev): <code className="text-slate-600">{changeDevCode}</code>
                  </p>
                )}
                <div>
                  <label htmlFor="change-contact-otp" className={labelClass}>
                    Код подтверждения
                  </label>
                  <input
                    id="change-contact-otp"
                    type="text"
                    inputMode="numeric"
                    className={`${modalInputClass} text-center tracking-[0.2em]${changeCodeError ? ' border-red-400' : ''}`}
                    value={changeCode}
                    onChange={(e) => setChangeCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    autoComplete="one-time-code"
                  />
                  {changeCodeError && (
                    <p className="mt-1.5 text-sm text-red-500" role="alert">
                      {changeCodeError}
                    </p>
                  )}
                </div>
                {changeError && <p className="mt-3 text-sm text-red-500">{changeError}</p>}
                <div className="mt-6 flex flex-wrap justify-end gap-2.5">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                    onClick={() => setChangeStep('value')}
                  >
                    Назад
                  </button>
                  <button
                    type="button"
                    className={`${saveBtnClass} inline-block`}
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
      )}

      {notifSettings && (
        <section className={cardClass} aria-labelledby="profile-notif-title">
          <h2 id="profile-notif-title" className={cardTitleClass}>
            Уведомления о заказах
          </h2>
          <span className={cardHintClass}>Выберите, как сообщать об изменении статуса заказа.</span>

          <ul className="flex flex-col space-y-4">
            <li>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 accent-red-500"
                  checked={notifSettings.emailOrderStatus}
                  onChange={(e) =>
                    onSettingsChange({ ...notifSettings, emailOrderStatus: e.target.checked })
                  }
                />
                <span>
                  <span className="text-sm font-medium text-slate-700">Email</span>
                  <span className="mt-0.5 block text-xs text-slate-400">
                    Письмо при смене статуса заказа
                  </span>
                </span>
              </label>
            </li>
            <li>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 accent-red-500"
                  checked={notifSettings.inAppOrderStatus}
                  onChange={(e) =>
                    onSettingsChange({ ...notifSettings, inAppOrderStatus: e.target.checked })
                  }
                />
                <span>
                  <span className="text-sm font-medium text-slate-700">В личном кабинете</span>
                  <span className="mt-0.5 block text-xs text-slate-400">
                    Раздел «Уведомления» на сайте
                  </span>
                </span>
              </label>
            </li>
          </ul>

          <button
            type="button"
            className={`${saveBtnClass} mt-6`}
            disabled={notifSaving}
            onClick={() => void saveNotifSettings()}
          >
            {notifSaving ? 'Сохранение…' : 'Сохранить настройки'}
          </button>
        </section>
      )}
    </div>
  );
}
