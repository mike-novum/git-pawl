export type ThemeMode = 'dark' | 'light';

export type Theme = ThemeMode;

export type ThemeContextValue = {
  theme: Theme;
  setTheme: (mode: Theme) => void;
  toggleTheme: () => void;
};
