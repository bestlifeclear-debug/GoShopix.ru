import { useEffect } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthForm } from '../components/auth/AuthForm';
import { SiteFooter } from '../components/layout/SiteFooter';
import { useAuthStore } from '../stores/authStore';
import styles from './AuthPage.module.css';

export function AuthPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const returnUrl = params.get('returnUrl') ?? '/account';

  useEffect(() => {
    const prev = document.title;
    document.title = 'Вход — GoShopix';
    return () => {
      document.title = prev;
    };
  }, []);

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
          <Link to="/" className={styles.backLink}>
            Назад в магазин
          </Link>
        </div>
      </header>

      <main className={styles.main} id="main-content">
        <AuthForm onSuccess={handleSuccess} />
      </main>

      <SiteFooter />
    </div>
  );
}
