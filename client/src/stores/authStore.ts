import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/index.js';
import type { User } from '../api/types.js';
import { mapApiError } from '../api/mapApiError.js';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await authApi.login(email, password);
          localStorage.setItem('goshopix_token', token);
          set({ user, token, isLoading: false });
        } catch (e) {
          const msg = mapApiError(e, 'Ошибка входа');
          set({ error: msg, isLoading: false });
          throw e;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await authApi.register(data);
          localStorage.setItem('goshopix_token', token);
          set({ user, token, isLoading: false });
        } catch (e) {
          const msg = mapApiError(e, 'Ошибка регистрации');
          set({ error: msg, isLoading: false });
          throw e;
        }
      },

      logout: () => {
        localStorage.removeItem('goshopix_token');
        set({ user: null, token: null, error: null });
      },

      fetchMe: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const user = await authApi.me();
          set({ user });
        } catch {
          get().logout();
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'goshopix-auth',
      partialize: (s) => ({ token: s.token, user: s.user }),
    },
  ),
);
