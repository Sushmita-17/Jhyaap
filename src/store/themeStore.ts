import { create } from 'zustand';

const THEME_KEY = 'nightowl_theme';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

function loadTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch {
    // Ignore errors
  }
  // Default to light theme (white)
  return 'light';
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: loadTheme(),
  
  setTheme: (theme) => {
    localStorage.setItem(THEME_KEY, theme);
    set({ theme });
  },
  
  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem(THEME_KEY, newTheme);
      return { theme: newTheme };
    });
  },
}));
