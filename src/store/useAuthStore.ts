import { create } from 'zustand';
import { User, AccessLog, PaymentRecord } from '../types';

interface AuthState {
  user: User | null;
  userAccessLogs: AccessLog[];
  userPayments: PaymentRecord[];
  loading: boolean;
  setUser: (user: User | null) => void;
  setUserAccessLogs: (logs: AccessLog[]) => void;
  setUserPayments: (payments: PaymentRecord[]) => void;
  checkSession: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userAccessLogs: [],
  userPayments: [],
  loading: true,

  setUser: (user) => {
    set({ user });
    if (user) {
      localStorage.setItem('streamhub_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('streamhub_user');
      localStorage.removeItem('streamhub_token');
    }
  },

  setUserAccessLogs: (userAccessLogs) => set({ userAccessLogs }),
  setUserPayments: (userPayments) => set({ userPayments }),

  checkSession: async () => {
    try {
      const token = localStorage.getItem('streamhub_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/auth/me', { headers });
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, loading: false });
        if (data.user) {
          localStorage.setItem('streamhub_user', JSON.stringify(data.user));
        }
        return;
      }
    } catch (err) {
      console.log('Session API check failed, falling back to local session');
    }

    const savedUser = localStorage.getItem('streamhub_user');
    if (savedUser) {
      try {
        set({ user: JSON.parse(savedUser), loading: false });
      } catch {
        set({ user: null, loading: false });
      }
    } else {
      set({ user: null, loading: false });
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('streamhub_user');
    localStorage.removeItem('streamhub_token');
    set({ user: null, userAccessLogs: [], userPayments: [] });
  }
}));
