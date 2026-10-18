import type { SliceCreator, UiSlice } from '../types';

export const createUiSlice: SliceCreator<UiSlice> = (set) => ({
  toasts: [],

  pushToast: (toast) => {
    const id = crypto.randomUUID();
    set((s) => ({
      toasts: [...s.toasts, { variant: 'info', duration: 4000, ...toast, id }],
    }));
    return id;
  },

  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  query: '',
  setQuery: (query) => set({ query }),
});
