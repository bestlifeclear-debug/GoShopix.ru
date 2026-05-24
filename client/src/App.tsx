import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useAuthStore } from './stores/authStore';

function bootstrapSession() {
  const { token } = useAuthStore.getState();
  if (token) {
    void useAuthStore.getState().fetchMe();
  }
}

export default function App() {
  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      bootstrapSession();
      return;
    }

    return useAuthStore.persist.onFinishHydration(() => {
      bootstrapSession();
    });
  }, []);

  return <RouterProvider router={router} />;
}
