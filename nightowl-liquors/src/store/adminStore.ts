import { create } from 'zustand';

const ADMIN_SESSION_KEY = 'nightowl_admin_session';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'nightowl';
const ADMIN_DISPLAY_NAME = 'Admin';
const ADMIN_ROLE = 'Administrator';

interface AdminState {
  isAdmin: boolean;
  username: string | null;
  displayName: string;
  role: string;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

function loadSession(): boolean {
  try {
    return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

const sessionActive = loadSession();

export const useAdminStore = create<AdminState>((set) => ({
  isAdmin: sessionActive,
  username: sessionActive ? ADMIN_USERNAME : null,
  displayName: ADMIN_DISPLAY_NAME,
  role: ADMIN_ROLE,

  login: (username, password) => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_SESSION_KEY, 'true');
      set({
        isAdmin: true,
        username: ADMIN_USERNAME,
        displayName: ADMIN_DISPLAY_NAME,
        role: ADMIN_ROLE,
      });
      return true;
    }
    return false;
  },

  logout: () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    set({ isAdmin: false, username: null });
  },
}));
