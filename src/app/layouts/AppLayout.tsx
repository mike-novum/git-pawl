import type { FC } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { ErrorBoundary } from '@/app/providers';
import { useAppStore } from '@/app/store';
import { AppHeader } from '@/widgets/app-header';
import { WorkspaceSelector } from '@/widgets/workspace-selector';

import type { AppLayoutProps } from './types';

const HOMEPAGE_PATH = '/workspaces';

export const AppLayout: FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeWorkspaceId = useAppStore((s) => s.activeWorkspaceId);

  const isHome = location.pathname === HOMEPAGE_PATH;
  const variant = isHome ? 'home' : 'workspace';

  const handleBack = (): void => {
    if (window.history.length > 1) navigate(-1);
    else navigate(HOMEPAGE_PATH);
  };

  return (
    <div className="bg-background text-foreground flex h-screen w-screen flex-col overflow-hidden">
      <AppHeader
        variant={variant}
        leftSlot={
          variant === 'workspace' ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Back"
                onClick={handleBack}
                className="text-muted-foreground hover:bg-surface-elevated hover:text-foreground flex size-8 items-center justify-center rounded-md transition-colors duration-(--duration-fast)"
              >
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
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              {activeWorkspaceId ? (
                <WorkspaceSelector workspaceId={activeWorkspaceId} />
              ) : null}
            </div>
          ) : null
        }
      />

      <main className="flex-1 overflow-auto">
        <ErrorBoundary>{children ?? <Outlet />}</ErrorBoundary>
      </main>
    </div>
  );
};
