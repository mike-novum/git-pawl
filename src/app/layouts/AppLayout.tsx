import type { FC } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';

import { ErrorBoundary } from '@/app/providers';
import { useAppStore } from '@/app/store';
import { Badge } from '@/shared/ui';
import { AppHeader } from '@/widgets/app-header';
import { WorkspaceSelector } from '@/widgets/workspace-selector';

import type { AppLayoutProps } from './types';

const HOMEPAGE_PATH = '/workspaces';
const REPOSITORY_PATH_PREFIX = '/repos/';

const WORKSPACE_ID_PATTERN = /^\/workspaces\/([^/]+)/;

const decodeRepoId = (id: string | undefined): string | null => {
  if (!id) return null;

  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
};

const lastPathSegment = (input: string | null): string | null => {
  if (!input) return null;
  const trimmed = input.replace(/[/\\]+$/, '');
  const parts = trimmed.split(/[/\\]/);
  return parts[parts.length - 1] ?? null;
};

const extractWorkspaceIdFromPath = (path: string): string | null => {
  const match = WORKSPACE_ID_PATTERN.exec(path);
  return match ? (match[1] ?? null) : null;
};

export const AppLayout: FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ id?: string }>();
  const activeWorkspaceId = useAppStore((s) => s.activeWorkspaceId);

  const isHome = location.pathname === HOMEPAGE_PATH;
  const isRepository = location.pathname.startsWith(REPOSITORY_PATH_PREFIX);
  const variant = isHome ? 'home' : isRepository ? 'repository' : 'workspace';
  const repoPath = isRepository ? decodeRepoId(params.id) : null;
  const repoName = lastPathSegment(repoPath);
  const selectorWorkspaceId =
    variant === 'workspace'
      ? (params.id ??
        extractWorkspaceIdFromPath(location.pathname) ??
        activeWorkspaceId)
      : null;

  const handleBack = (): void => {
    if (window.history.length > 1) navigate(-1);
    else navigate(HOMEPAGE_PATH);
  };

  return (
    <div className="bg-background text-foreground flex h-screen w-screen flex-col overflow-hidden">
      <AppHeader
        variant={variant}
        leftSlot={
          variant !== 'home' ? (
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
              {variant === 'repository' && repoName ? (
                <Badge
                  variant="outline"
                  size="sm"
                  className="max-w-64 truncate"
                  title={repoName}
                >
                  {repoName}
                </Badge>
              ) : null}
              {variant === 'workspace' && selectorWorkspaceId ? (
                <WorkspaceSelector workspaceId={selectorWorkspaceId} />
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
