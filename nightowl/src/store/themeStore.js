import { create } from 'zustand';

const THEME_KEY = 'nightowl_theme';

function loadTheme() {
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

function disableThemeTransitions() {
  if (typeof document === 'undefined') return;
  const root = document.body;
  root.classList.add('theme-transition-disabled');
  // Re-enable transitions very quickly to avoid visible lag.
  // 100ms requested.
  window.setTimeout(() => {
    root.classList.remove('theme-transition-disabled');
  }, 0);
}

function saveTheme(theme) {
  if (typeof window === 'undefined') return;
  const writeTheme = () => localStorage.setItem(THEME_KEY, theme);
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(writeTheme);
  } else {
    window.setTimeout(writeTheme, 0);
  }
}

export const useThemeStore = create((set) => ({
  theme: loadTheme(),
  
  setTheme: (theme) => {
    disableThemeTransitions();
    set({ theme });
    saveTheme(theme);
  },
  
  toggleTheme: () => {
    disableThemeTransitions();
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      saveTheme(newTheme);
      return { theme: newTheme };
    });
  },
}));

