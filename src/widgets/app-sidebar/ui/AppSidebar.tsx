import { FolderKanban, Plus, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAppStore } from '@/app/store';
import { useWorkspaceList } from '@/entities/workspace';
import { CreateWorkspaceDialog } from '@/features/workspace-create';
import { cn } from '@/shared/lib/theme';
import {
  Kbd,
  ScrollArea,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport
} from '@/shared/ui';

import type { AppSidebarProps } from '../types';

import { SidebarWorkspaceItem } from './SidebarWorkspaceItem';

const WORKSPACE_ROUTE_REGEX = /^\/workspaces\/([^/]+)$/;
const REPO_ROUTE_REGEX = /^\/repos\/([^/]+)$/;

const extractRouteParam = (pathname: string, regex: RegExp): string | null => {
  const match = regex.exec(pathname);
  if (!match?.[1]) return null;

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
};

export const AppSidebar: FC<AppSidebarProps> = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const activeWorkspaceId = useAppStore((state) => state.activeWorkspaceId);
  const setActiveWorkspaceId = useAppStore((state) => state.setActiveWorkspaceId);

  const { data: workspaces = [], isLoading } = useWorkspaceList();
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable) return;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleSidebar]);

  if (!sidebarOpen) {
    return null;
  }

  const isWorkspacesActive = location.pathname === '/workspaces';
  const isSettingsActive = location.pathname.startsWith('/settings');
  const routeWorkspaceId = extractRouteParam(
    location.pathname,
    WORKSPACE_ROUTE_REGEX
  );
  const activeRepoPath = extractRouteParam(location.pathname, REPO_ROUTE_REGEX);

  const handleWorkspacesClick = (): void => {
    navigate('/workspaces');
  };

  const handleNewWorkspaceClick = (): void => {
    setCreateOpen(true);
  };

  const handleSelectWorkspace = (workspaceId: string): void => {
    setActiveWorkspaceId(workspaceId);
    navigate(`/workspaces/${workspaceId}`);
  };

  const handleSelectRepo = (workspaceId: string, repoPath: string): void => {
    setActiveWorkspaceId(workspaceId);
    navigate(`/repos/${encodeURIComponent(repoPath)}`);
  };

  const handleSettingsClick = (): void => {
    navigate('/settings');
  };

  const handleToggleSidebar = (): void => {
    toggleSidebar();
  };

  return (
    <>
      <aside
        aria-label="Workspace navigation"
        className={cn(
          'bg-surface border-border flex h-full w-64 shrink-0 flex-col border-r select-none',
          className
        )}
      >
        <div className="border-border flex flex-col gap-1 border-b p-2">
          <button
            type="button"
            onClick={handleWorkspacesClick}
            aria-current={isWorkspacesActive ? 'page' : undefined}
            className={cn(
              'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-medium transition-colors duration-(--duration-fast)',
              isWorkspacesActive
                ? 'bg-accent text-accent-foreground'
                : 'text-foreground hover:bg-surface-elevated'
            )}
          >
            <FolderKanban aria-hidden="true" className="size-4 shrink-0" />
            <span>Workspaces</span>
          </button>

          <button
            type="button"
            onClick={handleNewWorkspaceClick}
            className="text-muted-foreground hover:bg-surface-elevated hover:text-foreground flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-medium transition-colors duration-(--duration-fast)"
          >
            <Plus aria-hidden="true" className="size-4 shrink-0" />
            <span>New workspace</span>
          </button>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <ScrollAreaViewport className="p-2">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground px-2 py-1 text-[11px] font-semibold tracking-wider uppercase">
                Workspaces
              </span>

              {!isLoading && workspaces.length === 0 ? (
                <p className="text-muted-foreground px-2 py-2 text-xs">
                  No workspaces yet
                </p>
              ) : (
                workspaces.map((workspace) => (
                  <SidebarWorkspaceItem
                    key={workspace.id}
                    workspace={workspace}
                    activeWorkspaceId={activeWorkspaceId}
                    routeWorkspaceId={routeWorkspaceId}
                    activeRepoPath={activeRepoPath}
                    onSelectWorkspace={handleSelectWorkspace}
                    onSelectRepo={handleSelectRepo}
                  />
                ))
              )}
            </div>
          </ScrollAreaViewport>
          <ScrollAreaScrollbar orientation="vertical">
            <ScrollAreaThumb />
          </ScrollAreaScrollbar>
        </ScrollArea>

        <div className="border-border flex items-center justify-between gap-2 border-t p-2">
          <button
            type="button"
            onClick={handleSettingsClick}
            aria-current={isSettingsActive ? 'page' : undefined}
            className={cn(
              'flex min-w-0 flex-1 items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-medium transition-colors duration-(--duration-fast)',
              isSettingsActive
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-surface-elevated hover:text-foreground'
            )}
          >
            <Settings aria-hidden="true" className="size-4 shrink-0" />
            <span>Settings</span>
          </button>

          <button
            type="button"
            onClick={handleToggleSidebar}
            aria-label="Collapse sidebar"
            title="Collapse sidebar (⌘B)"
            className="text-muted-foreground hover:text-foreground shrink-0 rounded p-0.5 transition-colors duration-(--duration-fast)"
          >
            <Kbd>⌘B</Kbd>
          </button>
        </div>
      </aside>

      <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
};

AppSidebar.displayName = 'AppSidebar';
