import { create } from 'zustand';
import { cartApi } from '../api/index.js';
import type { Cart } from '../api/types.js';
import { ApiClientError } from '../api/client.js';
import { mapApiError } from '../api/mapApiError.js';
import { useAuthStore } from './authStore.js';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  itemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,
  error: null,

  itemCount: () => get().cart?.itemCount ?? 0,

  fetchCart: async () => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ cart: null });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const cart = await cartApi.get();
      set({ cart, isLoading: false });
    } catch (e) {
      if (e instanceof ApiClientError && e.status === 401) {
        set({ cart: null, isLoading: false });
        return;
      }
      set({
        error: mapApiError(e, 'Не удалось загрузить корзину'),
        isLoading: false,
      });
    }
  },

  addToCart: async (variantId, quantity = 1) => {
    const token = useAuthStore.getState().token;
    if (!token) {
      throw new ApiClientError('Войдите, чтобы добавить в корзину', 401);
    }
    set({ isLoading: true, error: null });
    try {
      const cart = await cartApi.addItem(variantId, quantity);
      set({ cart, isLoading: false });
    } catch (e) {
      set({
        error: e instanceof ApiClientError ? e.message : 'Ошибка',
        isLoading: false,
      });
      throw e;
    }
  },

  updateQuantity: async (itemId, quantity) => {
    set({ isLoading: true });
    try {
      const cart = await cartApi.updateItem(itemId, quantity);
      set({ cart, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  removeItem: async (itemId) => {
    set({ isLoading: true });
    try {
      const cart = await cartApi.removeItem(itemId);
      set({ cart, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },
}));
