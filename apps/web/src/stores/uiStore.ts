import { create } from 'zustand';

type Theme = 'light' | 'dark';
type Locale = 'ar' | 'en';
type SidebarState = 'expanded' | 'collapsed';

interface UiState {
  theme: Theme;
  locale: Locale;
  sidebar: SidebarState;
  setTheme: (theme: Theme) => void;
  setLocale: (locale: Locale) => void;
  setSidebar: (state: SidebarState) => void;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  theme: 'light',
  locale: (localStorage.getItem('erp_locale') as Locale) ?? 'ar',
  sidebar: 'expanded',

  setTheme: (theme) => set({ theme }),
  setLocale: (locale) => set({ locale }),
  setSidebar: (sidebar) => set({ sidebar }),
  toggleSidebar: () =>
    set((s) => ({ sidebar: s.sidebar === 'expanded' ? 'collapsed' : 'expanded' })),
}));
