import { create } from 'zustand';
import { User, Role } from '@shared/types';
import { api } from '@/lib/api-client';
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password?: string) => Promise<User>;
  logout: () => void;
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<void>;
  updateUserRole: (userId: string, role: Role) => void;
}
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async (username, password) => {
    if (!password) {
      throw new Error("Password is required.");
    }
    const user = await api<User>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
    return user;
  },
  logout: () => {
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },
  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } else {
      get().logout();
    }
  },
  checkAuth: async () => {
    try {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        set({ user, isAuthenticated: true });
      }
    } catch (error) {
      console.error('Auth check failed', error);
      get().logout();
    } finally {
      set({ isLoading: false });
    }
  },
  updateUserRole: (userId, role) => {
    set(state => {
      if (state.user && state.user.id === userId) {
        const updatedUser = { ...state.user, role };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { user: updatedUser };
      }
      return state;
    });
  }
}));