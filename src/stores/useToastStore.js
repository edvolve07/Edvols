import { create } from 'zustand';

function createToastId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const useToastStore = create((set) => ({
  toasts: [],

  success: (message) => {
    const id = createToastId();
    set((state) => ({ toasts: [...state.toasts, { id, type: 'success', message }] }));
    window.setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4200);
  },

  error: (message) => {
    const id = createToastId();
    set((state) => ({ toasts: [...state.toasts, { id, type: 'error', message }] }));
    window.setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4200);
  },
}));

export default useToastStore;
