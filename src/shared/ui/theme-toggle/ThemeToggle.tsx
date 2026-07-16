import type { FC } from 'react';
import { Moon, Sun } from 'lucide-react';

import { cn, useTheme } from '@/shared/lib/theme';

import type { ThemeToggleProps } from './ThemeToggle.types';

export const ThemeToggle: FC<ThemeToggleProps> = ({ className }) => {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        'border-border bg-background text-foreground hover:bg-muted inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors',
        'duration-[var(--duration-fast)] ease-[var(--ease-fast)]',
        className,
      )}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
};
