import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/index';
import { mapApiError } from '../../api/mapApiError';
import { Button, Input, StatusBadge } from '../../design-system';
import { IconEye, IconEyeOff } from '../../design-system/icons/Icons';
import { useAuthStore } from '../../stores/authStore';
import {
  getPasswordStrength,
  validateEmail,
  validateLogin,
  validatePassword,
  validatePhone,
  validateUsername,
} from '../../utils/authValidation';
import { buildFullPhone, DEFAULT_COUNTRY, type CountryOption } from './countries';
import { PhoneField } from './PhoneField';
import styles from './AuthForm.module.css';

export type AuthMode = 'login' | 'register';

export interface AuthFormProps {
  onSuccess?: () => void;
  showDemoHint?: boolean;
}

type Step = 'phone' | 'login-password' | 'login-ident' | 'register';

type FieldKey = 'username' | 'email' | 'password' | 'phone' | 'login';

export function AuthForm({ onSuccess, showDemoHint = true }: AuthFormProps) {
  const login = useAuthStore((s) => s.login);
  const loginByPhone = useAuthStore((s) => s.loginByPhone);
  const register = useAuthStore((s) => s.register);
  const authError = useAuthStore((s) => s.error);
  const isLoading = useAuthStore((s) => s.isLoading);
  const clearError = useAuthStore((s) => s.clearError);

  const [step, setStep] = useState<Step>('phone');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [country, setCountry] = useState<CountryOption>(DEFAULT_COUNTRY);
  const [maskedEmail, setMaskedEmail] = useState<string | undefined>();
  const [storedPhone, setStoredPhone] = useState('');

  const [loginIdent, setLoginIdent] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [consent, setConsent] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [phoneCheckError, setPhoneCheckError] = useState<string | null>(null);

  const markTouched = (field: FieldKey) => {
    setTouched((t) => ({ ...t, [field]: true }));
  };

  const fullPhone = buildFullPhone(country, phoneDigits);

  const phoneError =
    (touched.phone || submitted) && step === 'phone'
      ? validatePhone(phoneDigits, country.minDigits)
      : undefined;

  const errors: Partial<Record<FieldKey, string>> = {};
  if (step === 'login-ident' && (touched.login || submitted)) {
    errors.login = validateLogin(loginIdent);
  }
  if (step === 'login-password' && (touched.password || submitted)) {
    errors.password = validatePassword(password);
  }
  if (step === 'login-ident' && (touched.password || submitted)) {
    errors.password = validatePassword(password);
  }
  if (step === 'register') {
    if (touched.username || submitted) errors.username = validateUsername(username);
    if (touched.email || submitted) errors.email = validateEmail(email);
    if (touched.password || submitted) errors.password = validatePassword(password, true);
  }

  const passwordStrength = step === 'register' ? getPasswordStrength(password) : null;

  const resetToPhone = () => {
    setStep('phone');
    setSubmitted(false);
    setTouched({});
    clearError();
  };

  const handleCheckPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    clearError();
    const err = validatePhone(phoneDigits, country.minDigits);
    if (err) return;

    setCheckingPhone(true);
    setPhoneCheckError(null);
    try {
      const { exists, maskedEmail: masked } = await authApi.checkPhone(fullPhone);
      setStoredPhone(fullPhone);
      setMaskedEmail(masked);
      setSubmitted(false);
      setTouched({});
      setStep(exists ? 'login-password' : 'register');
    } catch (e) {
      setPhoneCheckError(mapApiError(e, 'Не удалось проверить номер'));
    } finally {
      setCheckingPhone(false);
    }
  };

  const handleLoginPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    clearError();
    if (validatePassword(password)) return;
    try {
      await loginByPhone(storedPhone, password);
      onSuccess?.();
    } catch {
      /* store */
    }
  };

  const handleLoginIdent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    clearError();
    if (validateLogin(loginIdent) || validatePassword(password)) return;
    try {
      await login(loginIdent.trim(), password);
      onSuccess?.();
    } catch {
      /* store */
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    clearError();
    const fieldErrors = {
      username: validateUsername(username),
      email: validateEmail(email),
      password: validatePassword(password, true),
    };
    if (Object.values(fieldErrors).some(Boolean)) return;
    if (!consent) return;

    try {
      await register({
        email: email.trim(),
        password,
        username: username.trim(),
        phone: storedPhone,
      });
      onSuccess?.();
    } catch {
      /* store */
    }
  };

  const strengthClass =
    passwordStrength === 'weak'
      ? styles.strengthWeak
      : passwordStrength === 'medium'
        ? styles.strengthMedium
        : passwordStrength === 'strong'
          ? styles.strengthStrong
          : '';

  const passwordToggle = (
    <button
      type="button"
      className={styles.passwordToggle}
      onClick={() => setShowPassword((v) => !v)}
      aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
    >
      {showPassword ? <IconEyeOff /> : <IconEye />}
    </button>
  );

  if (step === 'phone') {
    return (
      <form className={styles.form} onSubmit={handleCheckPhone} noValidate>
        <p className={styles.stepHint}>Введите номер — мы определим, есть ли у вас аккаунт</p>
        <PhoneField
          value={phoneDigits}
          country={country}
          onValueChange={setPhoneDigits}
          onCountryChange={setCountry}
          error={phoneError}
          onBlur={() => markTouched('phone')}
          compact
          required
          data-testid="auth-phone"
        />
        {(phoneCheckError || authError) && (
          <div className={styles.globalError}>
            <StatusBadge variant="error" label={phoneCheckError ?? authError!} dot={false} />
          </div>
        )}
        <Button type="submit" fullWidth loading={checkingPhone || isLoading} data-testid="auth-submit">
          Продолжить
        </Button>
        <p className={styles.footerRow}>
          <button
            type="button"
            className={styles.switchMode}
            onClick={() => {
              clearError();
              setSubmitted(false);
              setStep('login-ident');
            }}
          >
            Войти по логину или email
          </button>
        </p>
      </form>
    );
  }

  if (step === 'login-ident') {
    return (
      <form className={styles.form} onSubmit={handleLoginIdent} noValidate>
        <Input
          label="Логин или email"
          autoComplete="username"
          value={loginIdent}
          onChange={(e) => setLoginIdent(e.target.value)}
          onBlur={() => markTouched('login')}
          error={errors.login}
          compact
          required
          data-testid="auth-login"
        />
        <Input
          label="Пароль"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => markTouched('password')}
          error={errors.password}
          compact
          required
          data-testid="auth-password"
          rightSlot={passwordToggle}
        />
        {authError && (
          <div className={styles.globalError}>
            <StatusBadge variant="error" label={authError} dot={false} />
          </div>
        )}
        <Button type="submit" fullWidth loading={isLoading} data-testid="auth-submit">
          Войти
        </Button>
        <p className={styles.footerRow}>
          <Link to="/auth?mode=reset" className={styles.link}>
            Забыли пароль?
          </Link>
          <button type="button" className={styles.switchMode} onClick={resetToPhone}>
            ← По номеру телефона
          </button>
        </p>
        {showDemoHint && (
          <p className={styles.demoHint}>
            Демо: <code>customer@goshopix.ru</code> / <code>password123</code>
          </p>
        )}
      </form>
    );
  }

  if (step === 'login-password') {
    return (
      <form className={styles.form} onSubmit={handleLoginPhone} noValidate>
        <p className={styles.stepHint}>
          Аккаунт найден{maskedEmail ? ` (${maskedEmail})` : ''}. Введите пароль
        </p>
        <Input
          label="Пароль"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => markTouched('password')}
          error={errors.password}
          compact
          required
          data-testid="auth-password"
          rightSlot={passwordToggle}
        />
        {authError && (
          <div className={styles.globalError}>
            <StatusBadge variant="error" label={authError} dot={false} />
          </div>
        )}
        <Button type="submit" fullWidth loading={isLoading} data-testid="auth-submit">
          Войти
        </Button>
        <p className={styles.footerRow}>
          <Link to="/auth?mode=reset" className={styles.link}>
            Забыли пароль?
          </Link>
          <button type="button" className={styles.switchMode} onClick={resetToPhone}>
            ← Другой номер
          </button>
        </p>
        {showDemoHint && (
          <p className={styles.demoHint}>
            Демо-телефон: <code>9001112233</code> / пароль <code>password123</code>
          </p>
        )}
      </form>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleRegister} noValidate>
      <p className={styles.stepHint}>Новый аккаунт. Заполните данные</p>
      <Input
        label="Логин"
        autoComplete="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onBlur={() => markTouched('username')}
        error={errors.username}
        compact
        required
        data-testid="auth-username"
      />
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => markTouched('email')}
        error={errors.email}
        compact
        required
        data-testid="auth-email"
      />
      <Input
        label="Пароль"
        type={showPassword ? 'text' : 'password'}
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onBlur={() => markTouched('password')}
        error={errors.password}
        compact
        required
        data-testid="auth-password"
        rightSlot={passwordToggle}
      />
      {password && passwordStrength && (
        <div className={styles.strengthWrap} aria-live="polite">
          <div className={styles.strength}>
            <span className={`${styles.strengthBar} ${strengthClass}`} />
            <span className={`${styles.strengthBar} ${passwordStrength !== 'weak' ? strengthClass : ''}`} />
            <span className={`${styles.strengthBar} ${passwordStrength === 'strong' ? strengthClass : ''}`} />
          </div>
        </div>
      )}
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
        Зарегистрироваться
      </Button>
      <p className={styles.footerRow}>
        <button type="button" className={styles.switchMode} onClick={resetToPhone}>
          ← Другой номер
        </button>
      </p>
    </form>
  );
}
