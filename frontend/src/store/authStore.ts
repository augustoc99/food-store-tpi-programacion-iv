import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/shared/api/api';
import { queryClient } from '@/shared/api/queryClient';
import type { User } from '@/features/auth/types/auth.types';

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';
interface AuthState {
  user: User | null; status: AuthStatus; loading: boolean; error: string | null;
  checkSession: () => Promise<void>; checkAuth: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>; clearSession: () => void;
}
let pending: Promise<void> | null = null;
export const useAuthStore = create<AuthState>()(persist((set) => ({
  user: null, status: 'checking', loading: false, error: null,
  checkSession: async () => {
    if (pending) return pending;
    set({ status: 'checking', loading: true });
    pending = (async () => {
      try {
        const { data } = await api.get<User>('/auth/me');
        set({ user: data, status: 'authenticated', error: null });
      } catch {
        queryClient.clear();
        set({ user: null, status: 'unauthenticated' });
      } finally { set({ loading: false }); }
    })();
    try { await pending; } finally { pending = null; }
  },
  checkAuth: async () => { await useAuthStore.getState().checkSession(); },
  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      await api.post('/auth/token', new URLSearchParams({ username, password }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
      const { data } = await api.get<User>('/auth/me');
      queryClient.clear();
      set({ user: data, status: 'authenticated' });
    } catch (error) {
      set({ user: null, status: 'unauthenticated', error: error instanceof Error ? error.message : 'Error de acceso' });
      throw error;
    } finally { set({ loading: false }); }
  },
  logout: async () => {
    await api.post('/auth/logout');
    queryClient.clear();
    set({ user: null, status: 'unauthenticated', loading: false });
  },
  clearSession: () => { queryClient.clear(); set({ user: null, status: 'unauthenticated', loading: false }); },
}), { name: 'foodstore-auth', partialize: (s) => ({ user: s.user }),
     merge: (persisted, current) => ({ ...current,
       ...(persisted as Partial<AuthState>), status: 'checking' as AuthStatus }) }));
