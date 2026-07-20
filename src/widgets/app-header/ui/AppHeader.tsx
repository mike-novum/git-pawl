import type { FC, ReactElement, ReactNode } from 'react';
import { Cat } from 'lucide-react';

import { ThemeToggle } from '@/shared/ui/theme-toggle';

import type { AppHeaderProps } from '../types';

const SettingsIcon = (): ReactElement => (
  <svg
    aria-hidden="true"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconButton: FC<{ onClick: () => void; label: string; children: ReactNode }> = ({
  onClick,
  label,
  children
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className="text-muted-foreground hover:bg-surface-elevated hover:text-foreground flex size-8 items-center justify-center rounded-md transition-colors duration-(--duration-fast)"
  >
    {children}
  </button>
);

export const AppHeader: FC<AppHeaderProps> = ({
  variant,
  leftSlot,
  metaSlot,
  rightSlot,
  hideSettings = false
}) => {
  const isHome = variant === 'home';

  const handleSettings = (): void => {
    window.location.hash = '#/settings';
  };

  return (
    <header className="bg-surface border-border flex h-12 shrink-0 items-center justify-between border-b px-4">
      <div className="flex min-w-0 items-center gap-2">
        {isHome ? (
          <div className="flex items-center gap-2">
            <Cat aria-hidden="true" className="text-primary size-5" />
            <span className="text-foreground text-sm font-semibold">git-pawl</span>
          </div>
        ) : (
          leftSlot
        )}
        {metaSlot}
      </div>
      <div className="flex items-center gap-1">
        {rightSlot}
        {!hideSettings ? (
          <IconButton onClick={handleSettings} label="Settings">
            <SettingsIcon />
          </IconButton>
        ) : null}
        <ThemeToggle />
      </div>
    </header>
  );
};

AppHeader.displayName = 'AppHeader';
