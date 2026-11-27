import { useCallback, useEffect, useMemo, useState, type FC } from 'react';
import { Settings } from 'lucide-react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';

import { CreateWorkspaceDialog } from '@/features/workspace-create';
import { CloneDialog } from '@/features/clone-repo';
import { useAddExistingRepo } from '@/features/add-existing-repo';
import { useRepoSearch } from '@/features/search-repos';
import {
  formatBytes,
  useActiveWorkspace,
  useRemoveWorkspace,
  useSetWorkspaceIcon,
  useWorkspaceById,
  useWorkspaceExtraRepoPaths
} from '@/entities/workspace';
import type { Repository } from '@/entities/repository';
import { useRepositoryList } from '@/entities/repository';
import type { AppLayoutOutletContext } from '@/shared/lib';
import { useToast } from '@/shared/ui';
import { useLocalStorageBool } from '@/shared/lib/framework';

import type { WorkspaceViewMode } from '../types';
import { EmptyWorkspace } from './EmptyWorkspace';
import { RepoGroup } from './RepoGroup';
import { WorkspaceSettingsDrawer } from './WorkspaceSettingsDrawer';
import { WorkspaceToolbar } from './WorkspaceToolbar';

export const WorkspacePage: FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams<{ id: string }>();
  const { setHeaderAction } = useOutletContext<AppLayoutOutletContext>();
  const active = useActiveWorkspace();
  const explicit = useWorkspaceById(id ?? null);
  const workspace = explicit ?? active;

  const workspacePath = workspace?.path ?? null;
  const workspaceId = workspace?.id ?? null;
  const { data: extraRepoPaths = [] } = useWorkspaceExtraRepoPaths(workspaceId);
  const { data: repos = [], isLoading } = useRepositoryList(workspacePath, extraRepoPaths);
  const { query, setQuery, results: visibleRepos } = useRepoSearch(repos);

  const [createOpen, setCreateOpen] = useState(false);
  const [cloneOpen, setCloneOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [grouped, setGrouped] = useLocalStorageBool('workspace-view-mode', true);
  const [viewMode, setViewMode] = useState<WorkspaceViewMode>(() => {
    if (typeof window === 'undefined') return 'grid';
    const saved = window.localStorage.getItem('workspace-layout-view');
    return saved === 'list' ? 'list' : 'grid';
  });

  const { mutate: addExistingRepo } = useAddExistingRepo();
  const { mutate: removeWorkspace } = useRemoveWorkspace();
  const { mutate: setWorkspaceIcon } = useSetWorkspaceIcon();

  useEffect(() => {
    const handleClick = (): void => {
      setSettingsOpen(true);
    };

    setHeaderAction(
      <button
        type="button"
        onClick={handleClick}
        aria-label="Workspace settings"
        className="text-muted-foreground hover:bg-surface-elevated hover:text-foreground flex size-8 items-center justify-center rounded-md transition-colors duration-(--duration-fast)"
      >
        <Settings aria-hidden="true" className="size-4" />
      </button>
    );

    return () => {
      setHeaderAction(null);
    };
  }, [setHeaderAction]);

  const handleViewModeChange = useCallback((mode: WorkspaceViewMode): void => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('workspace-layout-view', mode);
    }
  }, []);

  const handleAddRepo = useCallback((): void => {
    if (!workspaceId) return;
    addExistingRepo({ workspaceId });
  }, [addExistingRepo, workspaceId]);

  const handleClone = useCallback((): void => {
    setCloneOpen(true);
  }, []);

  const handleRepoClick = useCallback(
    (repo: Repository): void => {
      navigate(`/repos/${encodeURIComponent(repo.path)}`);
    },
    [navigate]
  );

  const handleDelete = useCallback((): void => {
    if (!workspaceId) return;
    removeWorkspace(
      { id: workspaceId },
      {
        onSuccess: () => {
          toast.success({ title: 'Workspace deleted' });
          navigate('/workspaces');
        },
        onError: (error) => {
          toast.error({
            title: 'Failed to delete workspace',
            description: error.message
          });
        }
      }
    );
  }, [navigate, removeWorkspace, toast, workspaceId]);

  const handleIconChange = useCallback(
    (sourceImagePath: string): void => {
      if (!workspaceId) return;

      setWorkspaceIcon(
        { workspaceId, sourceImagePath },
        {
          onSuccess: () => {
            toast.success({ title: 'Icon saved' });
          },
          onError: (error) => {
            toast.error({
              title: 'Failed to save icon',
              description: error.message
            });
          }
        }
      );
    },
    [setWorkspaceIcon, toast, workspaceId]
  );

  const handleClearSearch = useCallback((): void => {
    setQuery('');
  }, [setQuery]);

  const dirtyReposCount = useMemo(
    () => repos.filter((r) => r.status === 'dirty').length,
    [repos]
  );

  const totalSizeBytes = useMemo(
    () => repos.reduce((acc, r) => acc + (r.sizeBytes ?? 0), 0),
    [repos]
  );

  const groups = useMemo(() => {
    if (!grouped) {
      return [{ name: 'All', repos: visibleRepos }];
    }
    const byGroup = new Map<string, Repository[]>();
    for (const repo of visibleRepos) {
      const rel = workspacePath
        ? repo.path.replace(workspacePath, '').replace(/^[\\/]/, '')
        : repo.name;
      const group = rel.includes('/') ? rel.split('/')[0] ?? 'Root' : 'Root';
      const arr = byGroup.get(group) ?? [];
      arr.push(repo);
      byGroup.set(group, arr);
    }
    return Array.from(byGroup.entries()).map(([name, list]) => ({ name, repos: list }));
  }, [visibleRepos, grouped, workspacePath]);

  if (!workspace) {
    return (
      <>
        <div className="p-8 text-sm text-muted-foreground">Workspace not found.</div>
        <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />
        <CloneDialog
          open={cloneOpen}
          onOpenChange={setCloneOpen}
          activeWorkspace={null}
        />
      </>
    );
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-8">
        <WorkspaceToolbar
          path={workspace.path}
          query={query}
          onQueryChange={setQuery}
          grouped={grouped}
          onGroupedChange={setGrouped}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          onAddRepo={handleAddRepo}
          onClone={handleClone}
          totalReposCount={repos.length}
          filteredReposCount={visibleRepos.length}
        />

        {repos.length > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>
                <strong className="text-foreground font-semibold">{repos.length}</strong>{' '}
                {repos.length === 1 ? 'repository' : 'repositories'}
              </span>
              <span aria-hidden="true">·</span>
              {dirtyReposCount > 0 ? (
                <span className="text-amber-500 font-medium inline-flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {dirtyReposCount} with changes
                </span>
              ) : (
                <span className="text-emerald-500 font-medium inline-flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  All clean
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 font-mono">
              <span>{formatBytes(totalSizeBytes)} total</span>
            </div>
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground py-16">
            Loading...
          </div>
        ) : repos.length === 0 ? (
          <EmptyWorkspace onAddRepo={handleAddRepo} onClone={handleClone} />
        ) : visibleRepos.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-muted-foreground text-sm">
              No repositories match &ldquo;{query}&rdquo;
            </p>
            <button
              type="button"
              onClick={handleClearSearch}
              className="text-primary hover:underline text-xs font-medium"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {groups.map((g) => (
              <RepoGroup
                key={g.name}
                name={g.name}
                repos={g.repos}
                viewMode={viewMode}
                onRepoClick={handleRepoClick}
                onAddRepo={handleAddRepo}
              />
            ))}
          </div>
        )}
      </div>

      <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />
      <CloneDialog
        open={cloneOpen}
        onOpenChange={setCloneOpen}
        activeWorkspace={
          workspace
            ? { id: workspace.id, name: workspace.name, path: workspace.path }
            : null
        }
      />
      <WorkspaceSettingsDrawer
        workspace={workspace}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onIconChange={handleIconChange}
        onDelete={handleDelete}
      />
    </>
  );
};

WorkspacePage.displayName = 'WorkspacePage';
