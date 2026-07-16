import { useCallback, useMemo, useState } from 'react';
import type { FC, ReactNode } from 'react';

import { ThemeContext } from './themeContext';
import type { Theme, ThemeContextValue } from './types';

const readInitialTheme = (): Theme => {
  if (typeof document === 'undefined') {
    return 'dark';
  }
  const attr = document.documentElement.dataset.theme;
  if (attr === 'light' || attr === 'dark') {
    return attr;
  }
  return 'dark';
};

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
};

export const ThemeProvider: FC<ThemeProviderProps> = ({
  children,
  defaultTheme
}) => {
  const [theme, setThemeState] = useState<Theme>(
    defaultTheme ?? readInitialTheme()
  );

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = next;
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      if (typeof document !== 'undefined') {
        document.documentElement.dataset.theme = next;
      }
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
