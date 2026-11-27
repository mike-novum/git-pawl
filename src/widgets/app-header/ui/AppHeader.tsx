import type { FC, ReactElement, ReactNode } from 'react';
import { Cat, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { cn } from '@/shared/lib/theme';
import { Kbd } from '@/shared/ui';
import { ThemeToggle } from '@/shared/ui/theme-toggle';

import type { AppHeaderProps } from '../types';

const HOMEPAGE_PATHS = new Set<string>(['/', '/workspaces']);

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

const IconButton: FC<{
  onClick: () => void;
  label: string;
  title?: string;
  children: ReactNode;
}> = ({ onClick, label, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={title}
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
  hideSettings = false,
  sidebarOpen = false,
  onToggleSidebar,
  onOpenCommandPalette
}) => {
  const location = useLocation();
  const isHome = HOMEPAGE_PATHS.has(location.pathname) || variant === 'home';
  const showGlobalSettings = isHome && !hideSettings;

  const handleSettings = (): void => {
    window.location.hash = '#/settings';
  };

  return (
    <header
      className={cn(
        'flex h-12 shrink-0 items-center justify-between px-4',
        !isHome && 'bg-surface border-border border-b'
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {onToggleSidebar ? (
          <IconButton
            onClick={onToggleSidebar}
            label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
            title="Toggle sidebar (⌘B)"
          >
            {sidebarOpen ? (
              <PanelLeftClose aria-hidden="true" className="size-4" />
            ) : (
              <PanelLeftOpen aria-hidden="true" className="size-4" />
            )}
          </IconButton>
        ) : null}
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
        {onOpenCommandPalette ? (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            aria-label="Open command palette"
            title="Command palette (⌘K)"
            className="border-border bg-surface-elevated/60 text-muted-foreground hover:bg-surface-elevated hover:text-foreground mr-1 flex h-8 items-center gap-2 rounded-md border px-2.5 text-xs transition-colors duration-(--duration-fast)"
          >
            <Search aria-hidden="true" className="size-3.5 shrink-0" />
            <span>Search</span>
            <Kbd>⌘K</Kbd>
          </button>
        ) : null}
        {rightSlot}
        {showGlobalSettings ? (
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