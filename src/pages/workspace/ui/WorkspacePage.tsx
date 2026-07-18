import { useCallback, useMemo, useState, type FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { CreateWorkspaceDialog } from '@/features/workspace-create';
import { useAddExistingRepo } from '@/features/add-existing-repo';
import { useRepoSearch } from '@/features/search-repos';
import {
  useActiveWorkspace,
  useWorkspaceById,
  useWorkspaceExtraRepoPaths
} from '@/entities/workspace';
import type { Repository } from '@/entities/repository';
import { useRepositoryList } from '@/entities/repository';
import { useToast } from '@/shared/ui';

import { EmptyWorkspace } from './EmptyWorkspace';
import { RepoGroup } from './RepoGroup';
import { WorkspaceHero } from './WorkspaceHero';
import { WorkspaceSettingsDrawer } from './WorkspaceSettingsDrawer';
import { WorkspaceToolbar } from './WorkspaceToolbar';

export const WorkspacePage: FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams<{ id: string }>();
  const setActive = useAppStoreSetActive();
  const active = useActiveWorkspace();
  const explicit = useWorkspaceById(id ?? null);
  const workspace = explicit ?? active;

  useEffect(() => {
    if (workspace && id && workspace.id !== id) {
      setActive(workspace.id);
    }
  }, [id, workspace, setActive]);

  const workspacePath = workspace?.path ?? null;
  const workspaceId = workspace?.id ?? null;
  const { data: extraRepoPaths = [] } = useWorkspaceExtraRepoPaths(workspaceId);
  const { data: repos = [], isLoading } = useRepositoryList(workspacePath, extraRepoPaths);
  const { query, setQuery, results: visibleRepos } = useRepoSearch(repos);
  const [createOpen, setCreateOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [grouped, setGrouped] = useLocalStorageBool('workspace-view-mode', true);
  const { mutate: addExistingRepo } = useAddExistingRepo();

  const handleAddRepo = useCallback((): void => {
    if (!workspaceId) return;
    addExistingRepo({ workspaceId });
  }, [addExistingRepo, workspaceId]);

  const handleClone = useCallback((): void => {
    navigate('/clone');
  }, [navigate]);

  const handleRepoClick = useCallback(
    (repo: Repository): void => {
      navigate(`/repos/${encodeURIComponent(repo.id)}`);
    },
    [navigate]
  );

  const handleDelete = useCallback((): void => {
    toast.success({ title: 'Workspace deleted' });
    navigate('/workspaces');
  }, [navigate, toast]);

  const groups = useMemo(() => {
    if (!grouped) {
      return [{ name: 'All', repos: visibleRepos }];
    }
    const byGroup = new Map<string, Repository[]>();
    for (const repo of visibleRepos) {
      const rel = workspacePath ? repo.path.replace(workspacePath, '').replace(/^[\\/]/, '') : repo.name;
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
      </>
    );
  }

  const modifiedCount = repos.filter((r) => r.status === 'dirty').length;

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-8">
        <WorkspaceHero
          workspace={workspace}
          repoCount={repos.length}
          modifiedCount={modifiedCount}
          sizeBytes={null}
          onSettings={() => setSettingsOpen(true)}
        />

        <WorkspaceToolbar
          query={query}
          onQueryChange={setQuery}
          grouped={grouped}
          onGroupedChange={setGrouped}
          onAddRepo={handleAddRepo}
          onClone={handleClone}
        />

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : repos.length === 0 ? (
          <EmptyWorkspace onAddRepo={handleAddRepo} onClone={handleClone} />
        ) : (
          <div className="flex flex-col gap-6">
            {groups.map((g) => (
              <RepoGroup
                key={g.name}
                name={g.name}
                repos={g.repos}
                sizeBytesByRepo={new Map()}
                onRepoClick={handleRepoClick}
              />
            ))}
          </div>
        )}
      </div>

      <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />
      <WorkspaceSettingsDrawer
        workspace={workspace}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onDelete={handleDelete}
      />
    </>
  );
};

import { useEffect } from 'react';
import { useAppStore } from '@/app/store';
import { useLocalStorageBool } from '@/shared/lib/framework';

const useAppStoreSetActive = (): ((id: string) => void) => {
  const setActiveWorkspaceId = useAppStore((s) => s.setActiveWorkspaceId);
  return useCallback(
    (wid: string) => setActiveWorkspaceId(wid),
    [setActiveWorkspaceId]
  );
};

WorkspacePage.displayName = 'WorkspacePage';
