import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/index.js';
import type { User } from '../api/types.js';
import { mapApiError } from '../api/mapApiError.js';
import { useCartStore } from './cartStore.js';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (login: string, password: string) => Promise<void>;
  loginByPhone: (phone: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    username: string;
    firstName?: string;
    lastName?: string;
    phone: string;
  }) => Promise<void>;
  forgotPassword: (email: string) => Promise<{ devToken?: string }>;
  resetPassword: (token: string, password: string) => Promise<void>;
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

      login: async (login, password) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await authApi.login(login, password);
          localStorage.setItem('goshopix_token', token);
          set({ user, token, isLoading: false });
          useCartStore.getState().closeDrawer();
          await useCartStore.getState().mergeGuestCart();
        } catch (e) {
          const msg = mapApiError(e, 'Ошибка входа');
          set({ error: msg, isLoading: false });
          throw e;
        }
      },

      loginByPhone: async (phone, password) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await authApi.loginByPhone(phone, password);
          localStorage.setItem('goshopix_token', token);
          set({ user, token, isLoading: false });
          useCartStore.getState().closeDrawer();
          await useCartStore.getState().mergeGuestCart();
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
          useCartStore.getState().closeDrawer();
          await useCartStore.getState().mergeGuestCart();
        } catch (e) {
          const msg = mapApiError(e, 'Ошибка регистрации');
          set({ error: msg, isLoading: false });
          throw e;
        }
      },

      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authApi.forgotPassword(email);
          set({ isLoading: false });
          return { devToken: res.devToken };
        } catch (e) {
          const msg = mapApiError(e, 'Не удалось отправить запрос');
          set({ error: msg, isLoading: false });
          throw e;
        }
      },

      resetPassword: async (token, password) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token: jwt } = await authApi.resetPassword(token, password);
          localStorage.setItem('goshopix_token', jwt);
          set({ user, token: jwt, isLoading: false });
          useCartStore.getState().closeDrawer();
          await useCartStore.getState().mergeGuestCart();
        } catch (e) {
          const msg = mapApiError(e, 'Не удалось сменить пароль');
          set({ error: msg, isLoading: false });
          throw e;
        }
      },

      logout: () => {
        localStorage.removeItem('goshopix_token');
        useCartStore.getState().closeDrawer();
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
