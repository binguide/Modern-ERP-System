import { create } from 'zustand';
import { authApi, LoginPayload, User } from '@lib/api/endpoints/auth';
import { tokenStorage } from '@lib/api/axios';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (payload) => {
    const response = await authApi.login(payload);
    tokenStorage.set(response.accessToken);
    set({ user: response.user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      tokenStorage.clear();
      set({ user: null, isAuthenticated: false });
    }
  },

  loadUser: async () => {
    const token = tokenStorage.get();
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }
    try {
      const user = await authApi.me();
      set({ user, isAuthenticated: true });
    } catch {
      tokenStorage.clear();
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));
