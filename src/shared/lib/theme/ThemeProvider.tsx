import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FC, ReactNode } from 'react';

import { ThemeContext } from './themeContext';
import type { Theme, ThemeContextValue } from './types';

const STORAGE_KEY = 'git-pawl.theme';

const isTheme = (value: string | null | undefined): value is Theme =>
  value === 'dark' || value === 'light';

const readInitialTheme = (): Theme => {
  if (typeof document === 'undefined') {
    return 'dark';
  }
  const fromDom = document.documentElement.dataset.theme;
  if (isTheme(fromDom)) {
    return fromDom;
  }
  if (typeof window !== 'undefined') {
    const fromStorage = window.localStorage.getItem(STORAGE_KEY);
    if (isTheme(fromStorage)) {
      return fromStorage;
    }
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

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, theme);
    }
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
