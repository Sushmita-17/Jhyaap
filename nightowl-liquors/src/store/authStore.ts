import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (phone: string, name: string) => void;
  logout: () => void;
  updateProfile: (user: Partial<User>) => void;
}

const generateUserId = () => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const loadAuthFromStorage = (): User | null => {
  try {
    const stored = localStorage.getItem('jhyaap_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const saveAuthToStorage = (user: User) => {
  localStorage.setItem('jhyaap_user', JSON.stringify(user));
};

const removeAuthFromStorage = () => {
  localStorage.removeItem('jhyaap_user');
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: loadAuthFromStorage(),
  isAuthenticated: !!loadAuthFromStorage(),

  login: (phone: string, name: string) => {
    const newUser: User = {
      id: generateUserId(),
      phone,
      email: `${phone}@jhyaap.local`,
      name,
      walletBalance: 0,
    };
    saveAuthToStorage(newUser);
    set({ user: newUser, isAuthenticated: true });
  },

  logout: () => {
    removeAuthFromStorage();
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: (updates: Partial<User>) => {
    const current = get().user;
    if (current) {
      const updated = { ...current, ...updates };
      saveAuthToStorage(updated);
      set({ user: updated });
    }
  },
}));
