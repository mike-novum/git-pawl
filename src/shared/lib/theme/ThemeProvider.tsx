import { useCallback, useEffect, useMemo } from 'react';
import type { FC } from 'react';

import { useAppStore } from '@/app/store';

import { ThemeContext } from './themeContext';
import type { Theme, ThemeContextValue, ThemeProviderProps } from './types';

export const ThemeProvider: FC<ThemeProviderProps> = ({ children }) => {
  const theme = useAppStore((s) => s.theme);
  const setThemeInStore = useAppStore((s) => s.setTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setTheme = useCallback(
    (next: Theme) => {
      setThemeInStore(next);
    },
    [setThemeInStore]
  );

  const toggleTheme = useCallback(() => {
    setThemeInStore(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setThemeInStore]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
