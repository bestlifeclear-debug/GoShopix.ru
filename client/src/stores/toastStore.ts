import { create } from 'zustand';

interface ToastState {
  visible: boolean;
  message: string;
  show: (message?: string) => void;
  hide: () => void;
}

let hideTimer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set) => ({
  visible: false,
  message: 'Добавлено',
  show: (message = 'Добавлено') => {
    if (hideTimer) clearTimeout(hideTimer);
    set({ visible: true, message });
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
  useToastStore.getState().show('Добавлено');
}
