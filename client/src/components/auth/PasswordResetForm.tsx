import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, StatusBadge } from '../../design-system';
import { useAuthStore } from '../../stores/authStore';
import { validateEmail, validatePassword } from '../../utils/authValidation';
import styles from './AuthForm.module.css';

type ResetStep = 'request' | 'confirm';

export interface PasswordResetFormProps {
  initialToken?: string;
  onSuccess?: () => void;
}

export function PasswordResetForm({ initialToken = '', onSuccess }: PasswordResetFormProps) {
  const forgotPassword = useAuthStore((s) => s.forgotPassword);
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const authError = useAuthStore((s) => s.error);
  const isLoading = useAuthStore((s) => s.isLoading);
  const clearError = useAuthStore((s) => s.clearError);

  const [step, setStep] = useState<ResetStep>(initialToken ? 'confirm' : 'request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [devToken, setDevToken] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const emailError = submitted && step === 'request' ? validateEmail(email) : undefined;
  const passwordError = submitted && step === 'confirm' ? validatePassword(password, true) : undefined;

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    clearError();
    if (validateEmail(email)) return;
    try {
      const result = await forgotPassword(email.trim());
      if (result.devToken) setDevToken(result.devToken);
      setStep('confirm');
      setSubmitted(false);
    } catch {
      /* store */
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    clearError();
    if (!token.trim()) return;
    if (validatePassword(password, true)) return;
    try {
      await resetPassword(token.trim(), password);
      onSuccess?.();
    } catch {
      /* store */
    }
  };

  if (step === 'request') {
    return (
      <form className={styles.form} onSubmit={handleRequest} noValidate>
        <p className={styles.stepHint}>Введите email — отправим ссылку для сброса пароля</p>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError}
          compact
          required
          data-testid="reset-email"
        />
        {authError && (
          <div className={styles.globalError}>
            <StatusBadge variant="error" label={authError} dot={false} />
          </div>
        )}
        <Button type="submit" fullWidth loading={isLoading} data-testid="reset-request">
          Отправить
        </Button>
        <p className={styles.footerRow}>
          <Link to="/auth" className={styles.link}>
            ← Вернуться ко входу
          </Link>
        </p>
      </form>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleReset} noValidate>
      <p className={styles.stepHint}>
        {devToken
          ? 'Демо: скопируйте код ниже и задайте новый пароль'
          : 'Введите код из письма и новый пароль'}
      </p>
      {devToken && (
        <p className={styles.devToken} role="status">
          Код: <code>{devToken}</code>
        </p>
      )}
      <Input
        label="Код восстановления"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        compact
        required
        data-testid="reset-token"
      />
      <Input
        label="Новый пароль"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={passwordError}
        compact
        required
        data-testid="reset-password"
      />
      {authError && (
        <div className={styles.globalError}>
          <StatusBadge variant="error" label={authError} dot={false} />
        </div>
      )}
      <Button type="submit" fullWidth loading={isLoading} data-testid="reset-submit">
        Сохранить пароль
      </Button>
      <p className={styles.footerRow}>
        <button
          type="button"
          className={styles.switchMode}
          onClick={() => {
            setStep('request');
            setSubmitted(false);
            clearError();
          }}
        >
          Отправить код повторно
        </button>
        <Link to="/auth" className={styles.link}>
          ← Ко входу
        </Link>
      </p>
    </form>
  );
}
