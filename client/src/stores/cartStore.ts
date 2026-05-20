import { create } from 'zustand';
import { cartApi } from '../api/index.js';
import type { Cart } from '../api/types.js';
import { ApiClientError } from '../api/client.js';
import { mapApiError } from '../api/mapApiError.js';
import {
  addGuestLine,
  buildGuestCart,
  clearGuestCart,
  loadGuestCart,
  removeGuestLine,
  saveGuestCart,
  updateGuestQuantity,
  type CartItemSnapshot,
  type GuestCartLine,
} from '../lib/guestCart.js';
import {
  optimisticAddToCart,
  optimisticRemoveItem,
  optimisticUpdateQuantity,
} from '../lib/optimisticCart.js';
import { useAuthStore } from './authStore.js';

interface CartState {
  cart: Cart | null;
  guestItems: GuestCartLine[];
  drawerOpen: boolean;
  isLoading: boolean;
  error: string | null;
  initGuestCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  getCart: () => Cart | null;
  fetchCart: () => Promise<void>;
  mergeGuestCart: () => Promise<void>;
  addToCart: (variantId: string, quantity?: number, snapshot?: CartItemSnapshot) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  itemCount: () => number;
}

function isAuthenticated() {
  return Boolean(useAuthStore.getState().token);
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  guestItems: [],
  drawerOpen: false,
  isLoading: false,
  error: null,

  initGuestCart: () => {
    if (isAuthenticated()) return;
    const guestItems = loadGuestCart();
    set({ guestItems });
  },

  openDrawer: () => {
    if (isAuthenticated()) return;
    set({ drawerOpen: true });
  },
  closeDrawer: () => set({ drawerOpen: false }),

  getCart: () => {
    const { cart, guestItems } = get();
    if (isAuthenticated()) return cart;
    if (guestItems.length === 0) return null;
    return buildGuestCart(guestItems);
  },

  itemCount: () => get().getCart()?.itemCount ?? 0,

  fetchCart: async () => {
    if (!isAuthenticated()) {
      const guestItems = loadGuestCart();
      set({ cart: null, guestItems });
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

  mergeGuestCart: async () => {
    const { guestItems } = get();
    if (!isAuthenticated() || guestItems.length === 0) return;

    for (const line of guestItems) {
      try {
        await cartApi.addItem(line.variantId, line.quantity);
      } catch {
        /* skip failed lines */
      }
    }
    clearGuestCart();
    set({ guestItems: [] });
    await get().fetchCart();
  },

  addToCart: async (variantId, quantity = 1, snapshot) => {
    if (isAuthenticated()) {
      const previousCart = get().cart;
      if (snapshot) {
        set({
          cart: optimisticAddToCart(previousCart, snapshot, quantity),
          error: null,
        });
      }
      try {
        const cart = await cartApi.addItem(variantId, quantity);
        set({ cart, error: null });
      } catch (e) {
        set({
          cart: previousCart,
          error: e instanceof ApiClientError ? e.message : 'Ошибка',
        });
        throw e;
      }
      return;
    }

    if (!snapshot) {
      throw new Error('Не удалось добавить товар в корзину');
    }

    const guestItems = addGuestLine(get().guestItems, snapshot, quantity);
    saveGuestCart(guestItems);
    set({ guestItems, error: null });
  },

  updateQuantity: async (itemId, quantity) => {
    if (isAuthenticated()) {
      const previousCart = get().cart;
      if (previousCart) {
        set({ cart: optimisticUpdateQuantity(previousCart, itemId, quantity) });
      }
      try {
        const cart = await cartApi.updateItem(itemId, quantity);
        set({ cart });
      } catch (e) {
        set({ cart: previousCart });
        throw e;
      }
      return;
    }

    const guestItems = updateGuestQuantity(get().guestItems, itemId, quantity);
    saveGuestCart(guestItems);
    set({ guestItems });
  },

  removeItem: async (itemId) => {
    if (isAuthenticated()) {
      const previousCart = get().cart;
      if (previousCart) {
        set({ cart: optimisticRemoveItem(previousCart, itemId) });
      }
      try {
        const cart = await cartApi.removeItem(itemId);
        set({ cart });
      } catch (e) {
        set({ cart: previousCart });
        throw e;
      }
      return;
    }

    const guestItems = removeGuestLine(get().guestItems, itemId);
    saveGuestCart(guestItems);
    set({ guestItems });
  },
}));

/** Селектор для мгновенного бейджа корзины в шапке */
export function selectCartItemCount(state: CartState, isLoggedIn: boolean): number {
  if (isLoggedIn) return state.cart?.itemCount ?? 0;
  return state.guestItems.reduce((n, line) => n + line.quantity, 0);
}
