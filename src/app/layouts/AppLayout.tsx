import { ChevronLeft } from 'lucide-react';
import type { FC, ReactNode } from 'react';
import { useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';

import { ErrorBoundary } from '@/app/providers';
import { useAppStore } from '@/app/store';
import { useWorkspaceList, type Workspace } from '@/entities/workspace';
import type { AppLayoutOutletContext } from '@/shared/lib';
import { AppHeader } from '@/widgets/app-header';
import { AppSidebar } from '@/widgets/app-sidebar';
import { CommandPalette } from '@/widgets/command-palette';
import { WorkspaceSelector } from '@/widgets/workspace-selector';

import { RepositoryBreadcrumbs } from './RepositoryBreadcrumbs';
import { WorkspaceHeaderMeta } from './WorkspaceHeaderMeta';
import type { AppLayoutProps } from './types';

const HOMEPAGE_PATH = '/workspaces';
const REPOSITORY_PATH_PREFIX = '/repos/';
const SETTINGS_PATH = '/settings';

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

const resolveOwningWorkspace = (
  workspaces: Workspace[],
  repoPath: string | null,
  activeWorkspaceId: string | null
): Workspace | null => {
  if (repoPath) {
    const matched = workspaces.find(
      (w) => repoPath.startsWith(`${w.path}/`) || repoPath === w.path
    );
    if (matched) return matched;
  }

  return workspaces.find((w) => w.id === activeWorkspaceId) ?? null;
};

export const AppLayout: FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ id?: string }>();

  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const activeWorkspaceId = useAppStore((s) => s.activeWorkspaceId);
  const setActiveWorkspaceId = useAppStore((s) => s.setActiveWorkspaceId);

  const { data: workspaces = [] } = useWorkspaceList();
  const [headerAction, setHeaderAction] = useState<ReactNode>(null);
  const [commandOpen, setCommandOpen] = useState(false);

  const isHome = location.pathname === HOMEPAGE_PATH;
  const isSettings = location.pathname.startsWith(SETTINGS_PATH);
  const isRepository = location.pathname.startsWith(REPOSITORY_PATH_PREFIX);
  const variant = isHome
    ? 'home'
    : isSettings
      ? 'settings'
      : isRepository
        ? 'repository'
        : 'workspace';

  const repoPath = isRepository ? decodeRepoId(params.id) : null;
  const repoName = lastPathSegment(repoPath);
  const owningWorkspace = isRepository
    ? resolveOwningWorkspace(workspaces, repoPath, activeWorkspaceId)
    : null;

  const selectorWorkspaceId =
    variant === 'workspace'
      ? (params.id ??
        extractWorkspaceIdFromPath(location.pathname) ??
        activeWorkspaceId)
      : null;

  const outletContext: AppLayoutOutletContext = { setHeaderAction };

  const handleBack = (): void => {
    if (window.history.length > 1) navigate(-1);
    else navigate(HOMEPAGE_PATH);
  };

  const handleOpenCommandPalette = (): void => {
    setCommandOpen(true);
  };

  const handleNavigateWorkspaces = (): void => {
    navigate(HOMEPAGE_PATH);
  };

  const handleSelectWorkspace = (workspace: Workspace): void => {
    setActiveWorkspaceId(workspace.id);
    navigate(`/workspaces/${workspace.id}`);
  };

  return (
    <div className="bg-background text-foreground flex h-screen w-screen flex-col overflow-hidden">
      <AppHeader
        variant={variant}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
        onOpenCommandPalette={handleOpenCommandPalette}
        leftSlot={
          variant !== 'home' ? (
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                aria-label="Back"
                onClick={handleBack}
                className="text-muted-foreground hover:bg-surface-elevated hover:text-foreground flex size-8 shrink-0 items-center justify-center rounded-md transition-colors duration-(--duration-fast)"
              >
                <ChevronLeft aria-hidden="true" className="size-4" />
              </button>

              {variant === 'repository' ? (
                <RepositoryBreadcrumbs
                  repoPath={repoPath}
                  repoName={repoName}
                  owningWorkspace={owningWorkspace}
                  onNavigateWorkspaces={handleNavigateWorkspaces}
                  onSelectWorkspace={handleSelectWorkspace}
                />
              ) : null}

              {variant === 'workspace' && selectorWorkspaceId ? (
                <WorkspaceSelector workspaceId={selectorWorkspaceId} />
              ) : null}

              {variant === 'settings' ? (
                <span className="text-foreground text-sm font-medium">
                  Settings
                </span>
              ) : null}
            </div>
          ) : null
        }
        metaSlot={
          variant === 'workspace' && selectorWorkspaceId ? (
            <WorkspaceHeaderMeta workspaceId={selectorWorkspaceId} />
          ) : null
        }
        rightSlot={variant === 'workspace' ? headerAction : null}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <AppSidebar />
        <main className="min-w-0 flex-1 overflow-auto">
          <ErrorBoundary>
            {children ?? <Outlet context={outletContext} />}
          </ErrorBoundary>
        </main>
      </div>

      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onToggleSidebar={toggleSidebar}
      />
    </div>
  );
};
