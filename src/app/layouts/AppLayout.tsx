import type { FC } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { ErrorBoundary } from '@/app/providers';
import { ThemeToggle } from '@/shared/ui/theme-toggle';
import { WorkspaceSwitcher } from '@/widgets/workspace-switcher';

import type { AppLayoutProps, NavItem } from './types';

const NAV_ITEMS: NavItem[] = [
  { to: '/workspace', label: 'Workspace' },
  { to: '/accounts', label: 'Accounts' },
  { to: '/settings', label: 'Settings' }
];

const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
  [
    'block rounded-md px-3 py-2 text-sm transition-colors',
    'duration-(--duration-fast) ease-(--ease-fast)',
    isActive
      ? 'bg-primary text-primary-foreground'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
  ].join(' ');

export const AppLayout: FC<AppLayoutProps> = ({ children }) => (
  <div className="bg-background text-foreground flex h-screen w-screen overflow-hidden">
    <aside className="border-border bg-muted/30 flex w-64 shrink-0 flex-col border-r">
      <div className="border-border border-b p-4">
        <div className="text-muted-foreground text-xs uppercase tracking-wide">
          Workspace
        </div>
        <WorkspaceSwitcher className="mt-2 flex w-full items-center justify-between rounded-md text-sm transition-colors duration-(--duration-fast) ease-(--ease-fast) hover:bg-muted" />
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} className={navLinkClass}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-border flex justify-end border-t p-3">
        <ThemeToggle />
      </div>
    </aside>

    <main className="bg-background flex-1 overflow-auto">
      <ErrorBoundary>{children ?? <Outlet />}</ErrorBoundary>
    </main>
  </div>
);
