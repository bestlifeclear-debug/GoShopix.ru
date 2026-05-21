import { create } from 'zustand';

export type ToastKind = 'cart' | 'info';

interface ToastState {
  visible: boolean;
  message: string;
  kind: ToastKind;
  show: (message?: string, kind?: ToastKind) => void;
  hide: () => void;
}

let hideTimer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set) => ({
  visible: false,
  message: 'Добавлено',
  kind: 'cart',
  show: (message = 'Добавлено', kind: ToastKind = 'info') => {
    if (hideTimer) clearTimeout(hideTimer);
    set({ visible: true, message, kind });
    hideTimer = setTimeout(() => {
      set({ visible: false });
      hideTimer = null;
    }, 3000);
  },
  hide: () => {
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = null;
    set({ visible: false });
  },
}));

export function showCartAddedToast() {
  useToastStore.getState().show('Добавлено в корзину', 'cart');
}

export function showInfoToast(message: string) {
  useToastStore.getState().show(message, 'info');
}
