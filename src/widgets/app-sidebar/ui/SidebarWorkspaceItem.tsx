import { ChevronDown, ChevronRight, GitBranch } from 'lucide-react';
import { useState } from 'react';
import type { FC } from 'react';

import { useRepositoryList } from '@/entities/repository';
import {
  useWorkspaceExtraRepoPaths,
  useWorkspaceIcon,
  WorkspaceIcon
} from '@/entities/workspace';
import { cn } from '@/shared/lib/theme';
import { StatusDot } from '@/shared/ui';

import type { SidebarWorkspaceItemProps } from '../types';

export const SidebarWorkspaceItem: FC<SidebarWorkspaceItemProps> = ({
  workspace,
  activeWorkspaceId,
  routeWorkspaceId,
  activeRepoPath,
  onSelectWorkspace,
  onSelectRepo
}) => {
  const { data: extraRepoPaths = [] } = useWorkspaceExtraRepoPaths(workspace.id);
  const { data: repos = [], isLoading: isReposLoading } = useRepositoryList(
    workspace.path,
    extraRepoPaths
  );
  const { data: iconPath = null } = useWorkspaceIcon(workspace.id);

  const [userExpanded, setUserExpanded] = useState<boolean | null>(null);

  const containsActiveRepo =
    activeRepoPath !== null &&
    repos.some((repo) => repo.path === activeRepoPath);
  const isWorkspaceRouteActive = routeWorkspaceId === workspace.id;
  const isActive =
    isWorkspaceRouteActive ||
    activeWorkspaceId === workspace.id ||
    containsActiveRepo;
  const isExpanded = userExpanded ?? isActive;

  const handleToggleExpand = (): void => {
    setUserExpanded(!isExpanded);
  };

  const handleWorkspaceClick = (): void => {
    onSelectWorkspace(workspace.id);
  };

  return (
    <div className="flex flex-col gap-0.5">
      <div
        data-active={isActive ? 'true' : 'false'}
        className={cn(
          'flex items-center gap-1 rounded-md px-1 py-1 transition-colors duration-(--duration-fast)',
          isWorkspaceRouteActive
            ? 'bg-accent text-accent-foreground'
            : isActive
              ? 'bg-surface-elevated text-foreground'
              : 'text-muted-foreground hover:bg-surface-elevated hover:text-foreground'
        )}
      >
        <button
          type="button"
          onClick={handleToggleExpand}
          aria-expanded={isExpanded}
          aria-label={
            isExpanded
              ? `Collapse ${workspace.name}`
              : `Expand ${workspace.name}`
          }
          className="hover:bg-muted/60 flex size-5 shrink-0 items-center justify-center rounded transition-colors duration-(--duration-fast)"
        >
          {isExpanded ? (
            <ChevronDown aria-hidden="true" className="size-3.5" />
          ) : (
            <ChevronRight aria-hidden="true" className="size-3.5" />
          )}
        </button>

        <button
          type="button"
          onClick={handleWorkspaceClick}
          aria-current={isWorkspaceRouteActive ? 'page' : undefined}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <WorkspaceIcon
            workspace={workspace}
            iconPath={iconPath}
            size="sm"
            className="size-6 shrink-0 rounded-md"
          />
          <span className="min-w-0 flex-1 truncate text-xs font-medium">
            {workspace.name}
          </span>
          <span className="text-muted-foreground shrink-0 text-[11px] tabular-nums">
            {repos.length}
          </span>
        </button>
      </div>

      {isExpanded ? (
        <div className="border-border ml-3 flex flex-col gap-0.5 border-l pl-2">
          {isReposLoading && repos.length === 0 ? (
            <span className="text-muted-foreground px-2 py-1 text-xs">
              Loading…
            </span>
          ) : repos.length === 0 ? (
            <span className="text-muted-foreground px-2 py-1 text-xs">
              No repositories
            </span>
          ) : (
            repos.map((repo) => {
              const isRepoActive = activeRepoPath === repo.path;

              return (
                <button
                  key={repo.path}
                  type="button"
                  onClick={() => onSelectRepo(workspace.id, repo.path)}
                  aria-current={isRepoActive ? 'page' : undefined}
                  data-active={isRepoActive ? 'true' : 'false'}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors duration-(--duration-fast)',
                    isRepoActive
                      ? 'bg-accent text-accent-foreground font-medium'
                      : 'text-muted-foreground hover:bg-surface-elevated hover:text-foreground'
                  )}
                >
                  {repo.status === 'dirty' ? (
                    <StatusDot variant="warning" label="Dirty repository" />
                  ) : repo.status === 'clean' ? (
                    <StatusDot variant="clean" label="Clean repository" />
                  ) : null}

                  <span className="min-w-0 flex-1 truncate text-xs">
                    {repo.name}
                  </span>

                  {repo.currentBranch ? (
                    <span className="bg-muted text-muted-foreground inline-flex max-w-20 shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[10px]">
                      <GitBranch aria-hidden="true" className="size-2.5 shrink-0" />
                      <span className="truncate">{repo.currentBranch}</span>
                    </span>
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
};

SidebarWorkspaceItem.displayName = 'SidebarWorkspaceItem';
