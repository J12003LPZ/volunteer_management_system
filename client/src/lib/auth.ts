import { create } from 'zustand';
import { api } from './api';
import type { User } from '@/types';

type AuthState = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { firstName: string; lastName: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  hydrate: () => void;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  hydrate: () => {
    const token = localStorage.getItem('vms_token');
    const userStr = localStorage.getItem('vms_user');
    if (token && userStr) set({ token, user: JSON.parse(userStr) });
  },
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('vms_token', data.token);
    localStorage.setItem('vms_user', JSON.stringify(data.user));
    set({ token: data.token, user: data.user });
  },
  register: async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('vms_token', data.token);
    localStorage.setItem('vms_user', JSON.stringify(data.user));
    set({ token: data.token, user: data.user });
  },
  logout: () => {
    localStorage.removeItem('vms_token');
    localStorage.removeItem('vms_user');
    set({ token: null, user: null });
  },
}));
