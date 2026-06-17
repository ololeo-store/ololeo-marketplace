import { create } from 'zustand';
import { api, CustomerProfile } from '@/lib/api';

interface AuthState {
  token: string | null;
  customer: CustomerProfile | null;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => void;
  hydrate: () => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  token: null,
  customer: null,
  isLoading: true,

  login: async (email, password) => {
    const res = await api.login({ email, password });
    localStorage.setItem('customer_token', res.accessToken);
    localStorage.setItem('customer_data', JSON.stringify(res.customer));
    set({ token: res.accessToken, customer: res.customer });
  },

  register: async (data) => {
    const res = await api.register(data);
    localStorage.setItem('customer_token', res.accessToken);
    localStorage.setItem('customer_data', JSON.stringify(res.customer));
    set({ token: res.accessToken, customer: res.customer });
  },

  logout: () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_data');
    set({ token: null, customer: null });
  },

  hydrate: () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }
    const token = localStorage.getItem('customer_token');
    const data = localStorage.getItem('customer_data');
    if (token && data) {
      try {
        set({ token, customer: JSON.parse(data), isLoading: false });
      } catch {
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },
}));
