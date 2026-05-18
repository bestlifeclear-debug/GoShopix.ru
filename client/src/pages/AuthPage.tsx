import { useEffect } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthForm } from '../components/auth/AuthForm';
import { PasswordResetForm } from '../components/auth/PasswordResetForm';
import { SiteFooter } from '../components/layout/SiteFooter';
import { ThemeToggle } from '../components/ThemeToggle/ThemeToggle';
import { useAuthStore } from '../stores/authStore';
import styles from './AuthPage.module.css';

export function AuthPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const returnUrl = params.get('returnUrl') ?? '/account';
  const isReset = params.get('mode') === 'reset';
  const resetToken = params.get('token') ?? '';

  useEffect(() => {
    const prev = document.title;
    document.title = isReset ? 'Восстановление пароля — GoShopix' : 'Вход — GoShopix';
    return () => {
      document.title = prev;
    };
  }, [isReset]);

  if (token) {
    return <Navigate to={returnUrl} replace />;
  }

  const handleSuccess = () => {
    navigate(returnUrl, { replace: true });
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo} aria-label="GoShopix — на главную">
          <span className={styles.logoMark} aria-hidden>
            G
          </span>
          GoShopix
        </Link>
        <div className={styles.headerActions}>
          <ThemeToggle />
          <Link to="/" className={styles.backLink}>
            Назад в магазин
          </Link>
        </div>
      </header>

      <main className={styles.main} id="main-content">
        <div className={styles.card}>
          <h1 className={styles.title}>
            {isReset ? 'Восстановление пароля' : 'Войдите или зарегистрируйтесь'}
          </h1>
          {!isReset && (
            <p className={styles.subtitle}>Начните с номера телефона — это быстрее всего</p>
          )}
          {isReset ? (
            <PasswordResetForm initialToken={resetToken} onSuccess={handleSuccess} />
          ) : (
            <AuthForm onSuccess={handleSuccess} />
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
