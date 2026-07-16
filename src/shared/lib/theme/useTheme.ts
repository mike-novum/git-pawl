import { useCallback, useEffect, useState } from 'react';

import type { ThemeMode } from './types';

const STORAGE_KEY = 'git-pawl.theme';
const DEFAULT_THEME: ThemeMode = 'dark';

const isThemeMode = (value: string | null | undefined): value is ThemeMode =>
  value === 'dark' || value === 'light';

const readInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME;
  }

  const fromDom = document.documentElement.dataset.theme;
  if (isThemeMode(fromDom)) {
    return fromDom;
  }

  const fromStorage = window.localStorage.getItem(STORAGE_KEY);
  if (isThemeMode(fromStorage)) {
    return fromStorage;
  }

  return DEFAULT_THEME;
};

export const useTheme = (): {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  toggle: () => void;
} => {
  const [theme, setThemeState] = useState<ThemeMode>(readInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
  }, []);

  const toggle = useCallback(() => {
    setThemeState((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, setTheme, toggle };
};
