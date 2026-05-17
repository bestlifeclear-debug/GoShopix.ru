import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useAuthStore } from './stores/authStore';

export default function App() {
  const token = useAuthStore((s) => s.token);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    if (token) {
      localStorage.setItem('goshopix_token', token);
      void fetchMe();
    }
  }, [token, fetchMe]);

  return <RouterProvider router={router} />;
}
