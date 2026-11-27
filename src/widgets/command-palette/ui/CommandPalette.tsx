import {
  FolderGit2,
  FolderKanban,
  GitBranch,
  LayoutGrid,
  PanelLeft,
  Search,
  Settings,
  SunMoon
} from 'lucide-react';
import { useEffect, useState, type FC } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { useAppStore } from '@/app/store';
import { useBranches, useCheckoutBranch } from '@/entities/branch';
import {
  RepositoryBranchBadge,
  RepositoryStatusDot,
  useRepositoryList
} from '@/entities/repository';
import {
  useWorkspaceExtraRepoPaths,
  useWorkspaceList
} from '@/entities/workspace';
import { useTheme } from '@/shared/lib/theme';
import { Badge, Command, Dialog, Kbd } from '@/shared/ui';

import type { CommandPaletteProps, WorkspaceRepoItemsProps } from '../types';

const REPOS_ROUTE_PREFIX = '/repos/';

const decodeRepoSegment = (segment: string | undefined): string | null => {
  if (!segment) return null;
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
};

const extractRepoPath = (
  pathname: string,
  paramId?: string
): string | null => {
  if (!pathname.startsWith(REPOS_ROUTE_PREFIX)) return null;
  const fromPath = pathname.slice(REPOS_ROUTE_PREFIX.length).split('/')[0];
  return decodeRepoSegment(fromPath || paramId);
};

const WorkspaceRepoItems: FC<WorkspaceRepoItemsProps> = ({
  workspace,
  onSelectRepo
}) => {
  const { data: extraRepoPaths = [] } = useWorkspaceExtraRepoPaths(workspace.id);
  const { data: repos = [] } = useRepositoryList(workspace.path, extraRepoPaths);

  return (
    <>
      {repos.map((repo) => (
        <Command.Item
          key={`${workspace.id}:${repo.path}`}
          value={`${repo.name} · ${workspace.name} · ${workspace.id} · ${repo.path}`}
          keywords={[
            repo.name,
            workspace.name,
            repo.path,
            ...(repo.currentBranch ? [repo.currentBranch] : [])
          ]}
          onSelect={() => onSelectRepo(workspace.id, repo.path)}
          className="flex items-center justify-between gap-2"
        >
          <div className="flex min-w-0 items-center gap-2">
            <FolderGit2
              aria-hidden="true"
              className="text-muted-foreground size-4 shrink-0"
            />
            <span className="truncate font-medium">{repo.name}</span>
            <span className="text-muted-foreground truncate text-xs">
              {workspace.name}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {repo.status === 'dirty' ? (
              <RepositoryStatusDot status="dirty" />
            ) : null}
            {repo.currentBranch ? (
              <RepositoryBranchBadge branch={repo.currentBranch} />
            ) : null}
          </div>
        </Command.Item>
      ))}
    </>
  );
};

export const CommandPalette: FC<CommandPaletteProps> = ({
  open,
  onOpenChange,
  onToggleSidebar
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ id?: string }>();
  const setActiveWorkspaceId = useAppStore((s) => s.setActiveWorkspaceId);
  const { theme, toggleTheme } = useTheme();

  const { data: workspaces = [] } = useWorkspaceList();
  const currentRepoPath = extractRepoPath(location.pathname, params.id);
  const { data: branches = [] } = useBranches(currentRepoPath);
  const checkoutBranch = useCheckoutBranch();

  const handleOpenChange = (next: boolean): void => {
    if (!isControlled) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        const next = !isOpen;
        if (!isControlled) {
          setInternalOpen(next);
        }
        onOpenChange?.(next);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isControlled, onOpenChange]);

  const handleSelectRepo = (workspaceId: string, repoPath: string): void => {
    setActiveWorkspaceId(workspaceId);
    navigate(`/repos/${encodeURIComponent(repoPath)}`);
    handleOpenChange(false);
  };

  const handleSelectWorkspace = (workspaceId: string): void => {
    setActiveWorkspaceId(workspaceId);
    navigate(`/workspaces/${workspaceId}`);
    handleOpenChange(false);
  };

  const handleSelectBranch = (branchName: string, current: boolean): void => {
    if (!currentRepoPath) return;
    if (!current) {
      checkoutBranch.mutate({ repoPath: currentRepoPath, ref: branchName });
    }
    handleOpenChange(false);
  };

  const handleGoToWorkspaces = (): void => {
    navigate('/workspaces');
    handleOpenChange(false);
  };

  const handleGoToSettings = (): void => {
    navigate('/settings');
    handleOpenChange(false);
  };

  const handleToggleSidebar = (): void => {
    onToggleSidebar?.();
    handleOpenChange(false);
  };

  const handleToggleTheme = (): void => {
    toggleTheme();
    handleOpenChange(false);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup className="block max-w-xl gap-0 overflow-hidden p-0">
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>
          <Command.Root label="Command palette" className="rounded-none">
            <div className="border-border flex items-center gap-2 border-b px-3">
              <Search
                aria-hidden="true"
                className="text-muted-foreground size-4 shrink-0"
              />
              <Command.Input
                autoFocus
                placeholder="Search repositories, workspaces, branches, or actions…"
                className="border-b-0 px-0"
              />
              <Kbd>Esc</Kbd>
            </div>
            <Command.List className="max-h-96 p-1.5">
              <Command.Empty>No results found.</Command.Empty>

              {workspaces.length > 0 ? (
                <Command.Group
                  heading="Repositories"
                  className="[&:has([cmdk-group-items]:empty)]:hidden"
                >
                  {workspaces.map((ws) => (
                    <WorkspaceRepoItems
                      key={ws.id}
                      workspace={ws}
                      onSelectRepo={handleSelectRepo}
                    />
                  ))}
                </Command.Group>
              ) : null}

              {workspaces.length > 0 ? (
                <Command.Group heading="Workspaces">
                  {workspaces.map((ws) => (
                    <Command.Item
                      key={ws.id}
                      value={`${ws.name} · workspace · ${ws.id}`}
                      keywords={[ws.name, ws.path, 'workspace']}
                      onSelect={() => handleSelectWorkspace(ws.id)}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <FolderKanban
                          aria-hidden="true"
                          className="text-muted-foreground size-4 shrink-0"
                        />
                        <span className="truncate font-medium">{ws.name}</span>
                      </div>
                      <span className="text-muted-foreground truncate text-xs">
                        {ws.path}
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              ) : null}

              {currentRepoPath && branches.length > 0 ? (
                <Command.Group heading="Branches">
                  {branches.map((branch) => (
                    <Command.Item
                      key={branch.name}
                      value={`${branch.name} · branch`}
                      keywords={[branch.name, 'branch', 'checkout']}
                      onSelect={() =>
                        handleSelectBranch(branch.name, branch.current)
                      }
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <GitBranch
                          aria-hidden="true"
                          className="text-muted-foreground size-4 shrink-0"
                        />
                        <span className="truncate font-mono text-xs">
                          {branch.name}
                        </span>
                      </div>
                      {branch.current ? (
                        <Badge variant="default" size="sm">
                          Current
                        </Badge>
                      ) : null}
                    </Command.Item>
                  ))}
                </Command.Group>
              ) : null}

              <Command.Separator />

              <Command.Group heading="Navigation & Actions">
                <Command.Item
                  value="Go to Workspaces"
                  keywords={['workspaces', 'home', 'navigate']}
                  onSelect={handleGoToWorkspaces}
                  className="flex items-center gap-2"
                >
                  <LayoutGrid
                    aria-hidden="true"
                    className="text-muted-foreground size-4 shrink-0"
                  />
                  <span>Go to Workspaces</span>
                </Command.Item>
                <Command.Item
                  value="Go to Settings"
                  keywords={['settings', 'preferences', 'navigate']}
                  onSelect={handleGoToSettings}
                  className="flex items-center gap-2"
                >
                  <Settings
                    aria-hidden="true"
                    className="text-muted-foreground size-4 shrink-0"
                  />
                  <span>Go to Settings</span>
                </Command.Item>
                {onToggleSidebar ? (
                  <Command.Item
                    value="Toggle Sidebar"
                    keywords={['sidebar', 'panel', 'toggle']}
                    onSelect={handleToggleSidebar}
                    className="flex items-center gap-2"
                  >
                    <PanelLeft
                      aria-hidden="true"
                      className="text-muted-foreground size-4 shrink-0"
                    />
                    <span>Toggle Sidebar</span>
                  </Command.Item>
                ) : null}
                <Command.Item
                  value="Toggle Theme"
                  keywords={['theme', 'dark', 'light', 'appearance']}
                  onSelect={handleToggleTheme}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <SunMoon
                      aria-hidden="true"
                      className="text-muted-foreground size-4 shrink-0"
                    />
                    <span>Toggle Theme</span>
                  </div>
                  <span className="text-muted-foreground text-xs capitalize">
                    {theme}
                  </span>
                </Command.Item>
              </Command.Group>
            </Command.List>
          </Command.Root>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

CommandPalette.displayName = 'CommandPalette';
