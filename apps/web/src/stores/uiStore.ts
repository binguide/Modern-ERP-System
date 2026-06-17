import { create } from 'zustand';

type Theme = 'light' | 'dark';
type Locale = 'ar' | 'en';
type SidebarState = 'expanded' | 'collapsed';

interface UiState {
  theme: Theme;
  locale: Locale;
  sidebar: SidebarState;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setLocale: (locale: Locale) => void;
  setSidebar: (state: SidebarState) => void;
  toggleSidebar: () => void;
}

const storedTheme = (localStorage.getItem('erp_theme') as Theme) ?? 'light';
const storedLocale = (localStorage.getItem('erp_locale') as Locale) ?? 'ar';

export const useUiStore = create<UiState>((set) => ({
  theme: storedTheme,
  locale: storedLocale,
  sidebar: 'expanded',

  setTheme: (theme) => {
    localStorage.setItem('erp_theme', theme);
    set({ theme });
  },
  toggleTheme: () =>
    set((s) => {
      const next = s.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('erp_theme', next);
      return { theme: next };
    }),
  setLocale: (locale) => {
    localStorage.setItem('erp_locale', locale);
    set({ locale });
  },
  setSidebar: (sidebar) => set({ sidebar }),
  toggleSidebar: () =>
    set((s) => ({ sidebar: s.sidebar === 'expanded' ? 'collapsed' : 'expanded' })),
}));
