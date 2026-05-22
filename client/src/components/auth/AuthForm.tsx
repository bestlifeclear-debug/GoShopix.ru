import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mapApiError } from '../../api/mapApiError';
import { Button, Input, StatusBadge } from '../../design-system';
import { useAuthStore } from '../../stores/authStore';
import { validateIdentifier, validateOtpCode } from '../../utils/authValidation';
import styles from './AuthForm.module.css';

export interface AuthFormProps {
  onSuccess?: () => void;
  showDemoHint?: boolean;
}

type Step = 'identifier' | 'otp';

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

  const identifierError = (touched || submitted) && step === 'identifier' ? validateIdentifier(identifier) : undefined;
  const codeError = (touched || submitted) && step === 'otp' ? validateOtpCode(code) : undefined;

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
  };

  if (step === 'identifier') {
    return (
      <form className={styles.form} onSubmit={handleSendOtp} noValidate>
        <p className={styles.stepHint}>
          Введите телефон или email — мы отправим код для входа или регистрации
        </p>
        <Input
          label="Телефон или Email"
          autoComplete="username tel email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          onBlur={() => setTouched(true)}
          error={identifierError}
          compact
          required
          data-testid="auth-identifier"
        />
        {(sendError || authError) && (
          <div className={styles.globalError}>
            <StatusBadge variant="error" label={sendError ?? authError!} dot={false} />
          </div>
        )}
        <Button type="submit" fullWidth loading={isLoading} data-testid="auth-submit">
          Получить код
        </Button>
        {showDemoHint && (
          <p className={styles.demoHint}>
            Демо: <code>customer@goshopix.ru</code> или телефон <code>9001112233</code>
          </p>
        )}
      </form>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleVerify} noValidate>
      <p className={styles.stepHint}>
        Код отправлен на {maskedDestination || 'указанный контакт'}
      </p>
      {devCode && (
        <p className={styles.demoHint}>
          Код для разработки: <code>{devCode}</code>
        </p>
      )}
      <Input
        label="Код подтверждения"
        inputMode="numeric"
        autoComplete="one-time-code"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        onBlur={() => setTouched(true)}
        error={codeError}
        compact
        required
        data-testid="auth-otp"
      />
      <label className={styles.consent}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
        <span>
          Согласен на{' '}
          <Link to="/privacy" target="_blank" rel="noopener noreferrer">
            обработку персональных данных
          </Link>
        </span>
      </label>
      {submitted && !consent && (
        <p className={styles.globalError} role="alert">
          <StatusBadge variant="error" label="Подтвердите согласие" dot={false} />
        </p>
      )}
      {authError && (
        <div className={styles.globalError}>
          <StatusBadge variant="error" label={authError} dot={false} />
        </div>
      )}
      <Button type="submit" fullWidth loading={isLoading} data-testid="auth-submit">
        Войти
      </Button>
      <p className={styles.footerRow}>
        <button type="button" className={styles.switchMode} onClick={resetToIdentifier}>
          ← Другой телефон или email
        </button>
      </p>
    </form>
  );
}
