import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  resolveCartItemId,
  variantIdFromCartItemId,
} from '../lib/optimisticCart.js';

/** Варианты, удалённые до завершения POST /cart/items — дочистить после add. */
const variantsPendingRemove = new Set<string>();
import { showCartAddedToast, showInfoToast } from './toastStore.js';
import { track } from '../lib/analytics.js';
import { useAuthStore } from './authStore.js';

interface CartState {
  cart: Cart | null;
  guestItems: GuestCartLine[];
  drawerOpen: boolean;
  isLoading: boolean;
  /** Блокирует fetchCart, пока идёт add/update/remove — иначе сервер затирает оптимистичное состояние */
  pendingCartOps: number;
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

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
  cart: null,
  guestItems: [],
  drawerOpen: false,
  isLoading: false,
  pendingCartOps: 0,
  error: null,

  initGuestCart: () => {
    if (isAuthenticated()) return;
    const stored = get().guestItems;
    const guestItems = stored.length > 0 ? stored : loadGuestCart();
    if (guestItems.length > 0) saveGuestCart(guestItems);
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
      const guestItems =
        get().guestItems.length > 0 ? get().guestItems : loadGuestCart();
      if (guestItems.length > 0) saveGuestCart(guestItems);
      set({ cart: null, guestItems, isLoading: false });
      return;
    }

    if (get().pendingCartOps > 0) {
      return;
    }

    const showLoading = get().cart === null;
    set({ isLoading: showLoading, error: null });
    try {
      const cart = await cartApi.get();
      if (get().pendingCartOps > 0) {
        set({ isLoading: false });
        return;
      }
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

    set({ pendingCartOps: get().pendingCartOps + 1 });
    try {
      const items = guestItems.map((line) => ({
        variantId: line.variantId,
        quantity: line.quantity,
      }));
      const cart = await cartApi.merge(items);
      clearGuestCart();
      set({ guestItems: [], cart, error: null });
    } catch {
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
    } finally {
      set({ pendingCartOps: Math.max(0, get().pendingCartOps - 1) });
    }
  },

  addToCart: async (variantId, quantity = 1, snapshot) => {
    if (isAuthenticated()) {
      set({ pendingCartOps: get().pendingCartOps + 1 });
      const previousCart = get().cart;
      if (snapshot) {
        set({
          cart: optimisticAddToCart(previousCart, snapshot, quantity),
          error: null,
        });
      }
      try {
        const cart = await cartApi.addItem(variantId, quantity);
        if (variantsPendingRemove.has(variantId)) {
          variantsPendingRemove.delete(variantId);
          const line = cart.items.find((i) => i.variant.id === variantId);
          if (line) {
            const cleaned = await cartApi.removeItem(line.id);
            set({ cart: cleaned, error: null });
            return;
          }
          const items = cart.items.filter((i) => i.variant.id !== variantId);
          const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
          set({
            cart: {
              ...cart,
              items,
              itemCount: items.reduce((n, i) => n + i.quantity, 0),
              subtotal,
            },
            error: null,
          });
          return;
        }
        set({ cart, error: null });
        showCartAddedToast();
        track('add_to_cart', { variantId, quantity });
      } catch (e) {
        const message = mapApiError(e, 'Не удалось добавить в корзину');
        set({ cart: previousCart, error: message });
        showInfoToast(message);
        throw e;
      } finally {
        set({ pendingCartOps: Math.max(0, get().pendingCartOps - 1) });
      }
      return;
    }

    if (!snapshot) {
      throw new Error('Не удалось добавить товар в корзину');
    }

    const guestItems = addGuestLine(get().guestItems, snapshot, quantity);
    saveGuestCart(guestItems);
    set({ guestItems, error: null });
    showCartAddedToast();
    track('add_to_cart', { variantId: snapshot.variantId, quantity });
  },

  updateQuantity: async (itemId, quantity) => {
    if (isAuthenticated()) {
      set({ pendingCartOps: get().pendingCartOps + 1 });
      const previousCart = get().cart;
      const resolvedId = resolveCartItemId(previousCart, itemId);
      if (previousCart) {
        set({ cart: optimisticUpdateQuantity(previousCart, itemId, quantity) });
      }
      try {
        const cart = await cartApi.updateItem(resolvedId, quantity);
        set({ cart });
      } catch (e) {
        set({ cart: previousCart });
        throw e;
      } finally {
        set({ pendingCartOps: Math.max(0, get().pendingCartOps - 1) });
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
      const resolvedId = resolveCartItemId(previousCart, itemId);
      const variantId = variantIdFromCartItemId(itemId, previousCart);

      if (resolvedId.startsWith('opt-') && variantId) {
        variantsPendingRemove.add(variantId);
        if (previousCart) {
          set({ cart: optimisticRemoveItem(previousCart, itemId) });
        }
        if (get().pendingCartOps > 0) {
          return;
        }
        set({ pendingCartOps: get().pendingCartOps + 1 });
        try {
          const fresh = await cartApi.get();
          const line = fresh.items.find((i) => i.variant.id === variantId);
          if (line) {
            const cart = await cartApi.removeItem(line.id);
            set({ cart });
          } else {
            set({ cart: fresh });
          }
        } catch (e) {
          set({ cart: previousCart });
          throw e;
        } finally {
          variantsPendingRemove.delete(variantId);
          set({ pendingCartOps: Math.max(0, get().pendingCartOps - 1) });
        }
        return;
      }

      set({ pendingCartOps: get().pendingCartOps + 1 });
      if (previousCart) {
        set({ cart: optimisticRemoveItem(previousCart, itemId) });
      }
      try {
        const cart = await cartApi.removeItem(resolvedId);
        set({ cart });
      } catch (e) {
        if (
          e instanceof ApiClientError &&
          e.status === 404 &&
          variantId
        ) {
          try {
            const fresh = await cartApi.get();
            const line = fresh.items.find((i) => i.variant.id === variantId);
            if (line) {
              const cart = await cartApi.removeItem(line.id);
              set({ cart });
              return;
            }
            set({ cart: fresh });
            return;
          } catch {
            /* fall through to rollback */
          }
        }
        set({ cart: previousCart });
        throw e;
      } finally {
        set({ pendingCartOps: Math.max(0, get().pendingCartOps - 1) });
      }
      return;
    }

    const guestItems = removeGuestLine(get().guestItems, itemId);
    saveGuestCart(guestItems);
    set({ guestItems });
  },
}),
    {
      name: 'goshopix-cart-guest',
      partialize: (state) => ({ guestItems: state.guestItems }),
      merge: (persisted, current) => {
        const p = persisted as Partial<CartState> | undefined;
        const fromStorage = loadGuestCart();
        const guestItems =
          p?.guestItems && p.guestItems.length > 0
            ? p.guestItems
            : fromStorage.length > 0
              ? fromStorage
              : current.guestItems;
        if (guestItems.length > 0) saveGuestCart(guestItems);
        return { ...current, guestItems };
      },
    },
  ),
);

/** Селектор для мгновенного бейджа корзины в шапке */
export function selectCartItemCount(state: CartState, isLoggedIn: boolean): number {
  if (isLoggedIn) return state.cart?.itemCount ?? 0;
  return state.guestItems.reduce((n, line) => n + line.quantity, 0);
}
