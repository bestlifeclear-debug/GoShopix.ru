import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export function SellerGuard() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const location = useLocation();

  useEffect(() => {
    if (token) void fetchMe();
  }, [token, fetchMe]);

  if (!token) {
    return <Navigate to="/account?tab=login" state={{ from: location }} replace />;
  }

  if (user && user.role !== 'SELLER') {
    return <Navigate to="/account" replace />;
  }

  return <Outlet />;
}
