import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mapApiError } from '../../api/mapApiError';
import { useAuthStore } from '../../stores/authStore';
import { validateIdentifier, validateOtpCode } from '../../utils/authValidation';
import './auth-form.css';

export interface AuthFormProps {
  onSuccess?: () => void;
  showDemoHint?: boolean;
}

type Step = 'identifier' | 'otp';

const DEMO_EMAIL = 'customer@goshopix.ru';
const DEMO_PHONE = '9001112233';

const inputClass =
  'w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-base text-slate-800 placeholder-slate-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all disabled:opacity-60';

const labelClass = 'mb-2 block text-sm font-medium text-slate-600';

const primaryBtnClass =
  'w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3.5 px-4 rounded-xl transition-colors active:scale-[0.99] text-base mt-2 disabled:pointer-events-none disabled:opacity-60';

export function AuthForm({ onSuccess, showDemoHint = true }: AuthFormProps) {
  const sendOtp = useAuthStore((s) => s.sendOtp);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const authError = useAuthStore((s) => s.error);
  const isLoading = useAuthStore((s) => s.isLoading);
  const clearError = useAuthStore((s) => s.clearError);

  const [step, setStep] = useState<Step>('identifier');
  const [identifier, setIdentifier] = useState('');
  const [storedIdentifier, setStoredIdentifier] = useState('');
  const [maskedDestination, setMaskedDestination] = useState('');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [touched, setTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const identifierError =
    (touched || submitted) && step === 'identifier' ? validateIdentifier(identifier) : undefined;
  const codeError = (touched || submitted) && step === 'otp' ? validateOtpCode(code) : undefined;
  const displayError = sendError ?? authError;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    clearError();
    setSendError(null);
    const err = validateIdentifier(identifier);
    if (err) return;

    try {
      const res = await sendOtp(identifier.trim());
      setStoredIdentifier(identifier.trim());
      setMaskedDestination(res.maskedDestination);
      if (res.devCode) setDevCode(res.devCode);
      setStep('otp');
      setSubmitted(false);
      setTouched(false);
      setCode('');
    } catch (e) {
      setSendError(mapApiError(e, 'Не удалось отправить код'));
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    clearError();
    if (validateOtpCode(code)) return;
    if (!consent) return;

    try {
      await verifyOtp(storedIdentifier, code.trim());
      onSuccess?.();
    } catch {
      /* store */
    }
  };

  const resetToIdentifier = () => {
    setStep('identifier');
    setSubmitted(false);
    setTouched(false);
    setCode('');
    setDevCode(null);
    clearError();
    setSendError(null);
  };

  const fillDemo = (value: string) => {
    setIdentifier(value);
    setTouched(false);
    setSubmitted(false);
    clearError();
    setSendError(null);
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_8px_32px_rgb(15,23,42,0.06)] sm:p-8">
      {step === 'identifier' ? (
        <form onSubmit={handleSendOtp} noValidate>
          <h2 className="text-center text-2xl font-bold text-slate-800">Вход или регистрация</h2>
          <p className="mb-6 mt-2 text-center text-sm leading-relaxed text-slate-500">
            Мы отправим код подтверждения
          </p>

          <div className="flex flex-col space-y-4">
            <div>
              <label htmlFor="auth-identifier" className={labelClass}>
                Почта или телефон
              </label>
              <input
                id="auth-identifier"
                type="text"
                className={`${inputClass}${identifierError ? ' border-red-400 focus:border-red-500 focus:ring-red-500/10' : ''}`}
                placeholder="Почта или телефон"
                autoComplete="username tel email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                onBlur={() => setTouched(true)}
                required
                data-testid="auth-identifier"
              />
              {identifierError && (
                <p className="mt-1.5 text-sm text-red-500" role="alert">
                  {identifierError}
                </p>
              )}
            </div>

            {displayError && (
              <p
                className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600"
                role="alert"
              >
                {displayError}
              </p>
            )}

            <button
              type="submit"
              className={primaryBtnClass}
              disabled={isLoading}
              data-testid="auth-submit"
            >
              {isLoading ? 'Отправка…' : 'Продолжить'}
            </button>
          </div>

          {showDemoHint && (
            <div className="mt-6 border-t border-slate-100 pt-5 text-center">
              <span className="mb-3 block text-xs text-slate-400">Демо-вход</span>
              <div>
                <button
                  type="button"
                  className="m-1 inline-block rounded-lg border border-slate-200/60 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
                  onClick={() => fillDemo(DEMO_EMAIL)}
                >
                  {DEMO_EMAIL}
                </button>
                <button
                  type="button"
                  className="m-1 inline-block rounded-lg border border-slate-200/60 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
                  onClick={() => fillDemo(DEMO_PHONE)}
                >
                  +7 {DEMO_PHONE}
                </button>
              </div>
            </div>
          )}
        </form>
      ) : (
        <form onSubmit={handleVerify} noValidate>
          <h2 className="text-center text-2xl font-bold text-slate-800">Код подтверждения</h2>
          <span className="mb-6 mt-2 block text-center text-sm text-slate-400">
            Отправлен на {maskedDestination || 'указанный контакт'}
          </span>

          <div className="flex flex-col space-y-4">
            {devCode && (
              <div
                className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-center"
                role="status"
              >
                <p className="text-xs font-medium text-slate-600">Код для тестового стенда</p>
                <p className="mt-1 text-2xl font-bold tracking-[0.2em] text-red-500">
                  <code data-testid="auth-dev-code">{devCode}</code>
                </p>
              </div>
            )}

            <div>
              <label htmlFor="auth-otp" className={labelClass}>
                Код из письма или SMS
              </label>
              <input
                id="auth-otp"
                type="text"
                inputMode="numeric"
                className={`${inputClass} text-center tracking-[0.25em]${codeError ? ' border-red-400' : ''}`}
                placeholder="000000"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onBlur={() => setTouched(true)}
                required
                data-testid="auth-otp"
              />
              {codeError && (
                <p className="mt-1.5 text-sm text-red-500" role="alert">
                  {codeError}
                </p>
              )}
            </div>

            <label className="flex cursor-pointer items-start gap-2.5 text-sm text-slate-600">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0 accent-red-500 rounded border-slate-300 focus:ring-red-500/20"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                required
              />
              <span>
                Согласен на{' '}
                <Link
                  to="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-500 hover:text-red-600 hover:underline"
                >
                  обработку персональных данных
                </Link>
              </span>
            </label>
            {submitted && !consent && (
              <p className="text-sm text-red-500" role="alert">
                Подтвердите согласие
              </p>
            )}

            {authError && (
              <p
                className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600"
                role="alert"
              >
                {authError}
              </p>
            )}

            <button
              type="submit"
              className={primaryBtnClass}
              disabled={isLoading}
              data-testid="auth-submit"
            >
              {isLoading ? 'Проверка…' : 'Войти'}
            </button>

            <button
              type="button"
              className="w-full text-center text-sm text-slate-400 transition-colors hover:text-red-500"
              onClick={resetToIdentifier}
            >
              ← Другой телефон или email
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
