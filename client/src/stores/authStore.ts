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
  sendOtp: (identifier: string) => Promise<{ maskedDestination: string; devCode?: string }>;
  verifyOtp: (identifier: string, code: string) => Promise<void>;
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

      sendOtp: async (identifier) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authApi.sendOtp(identifier);
          set({ isLoading: false });
          return res;
        } catch (e) {
          const msg = mapApiError(e, 'Не удалось отправить код');
          set({ error: msg, isLoading: false });
          throw e;
        }
      },

      verifyOtp: async (identifier, code) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await authApi.verifyOtp(identifier, code);
          localStorage.setItem('goshopix_token', token);
          set({ user, token, isLoading: false });
          useCartStore.getState().closeDrawer();
          await useCartStore.getState().mergeGuestCart();
        } catch (e) {
          const msg = mapApiError(e, 'Неверный код или ошибка входа');
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
