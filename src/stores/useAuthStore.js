import { create } from 'zustand';
import { apiFetch } from '../portal/utils/api';

const useAuthStore = create((set) => ({
  user: null,
  loading: Boolean(localStorage.getItem('token') || localStorage.getItem('auth_token')),
  revoked: false,

  refresh: async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    if (!token) {
      set({ loading: false });
      return;
    }
    localStorage.setItem('token', token);
    localStorage.setItem('auth_token', token);
    try {
      const data = await apiFetch('/auth/me');
      set({ user: data.user, revoked: false, loading: false });
    } catch (error) {
      if (error.locked) {
        set({ revoked: true, user: null, loading: false });
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('auth_token');
        set({ user: null, loading: false });
      }
    }
  },

  loginWithToken: (token, nextUser) => {
    localStorage.setItem('token', token);
    localStorage.setItem('auth_token', token);
    set({ user: nextUser, revoked: false });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    set({ user: null, revoked: false });
  },
}));

const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
if (token) {
  useAuthStore.getState().refresh();
}

export default useAuthStore;
