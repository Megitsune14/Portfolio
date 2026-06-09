import { createContext } from 'react';

export type Theme = 'light' | 'dark';

export type ThemeProviderContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

export const ThemeProviderContext = createContext<ThemeProviderContextValue | undefined>(undefined);
