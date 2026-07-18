import { useCallback, useState } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { CreateWorkspaceDialog } from '@/features/workspace-create';
import { useRepoSearch } from '@/features/search-repos';
import { useAddExistingRepo } from '@/features/add-existing-repo';
import {
  useActiveWorkspace,
  useWorkspaceExtraRepoPaths
} from '@/entities/workspace';
import { useRepositoryList } from '@/entities/repository';
import type { Repository } from '@/entities/repository';
import { Spinner, useToast, Button } from '@/shared/ui';

import { NoReposState } from './NoReposState';
import { NoResultsState } from './NoResultsState';
import { NoWorkspaceState } from './NoWorkspaceState';
import { RepoGrid } from './RepoGrid';
import { RepoSearchInput } from './RepoSearchInput';
import { WorkspaceHeader } from './WorkspaceHeader';

import type { WorkspacePageProps } from '../types';

const basename = (path: string): string => {
  const cleaned = path.replace(/[\\/]+$/, '');
  const parts = cleaned.split(/[\\/]/);
  return parts[parts.length - 1] ?? cleaned;
};

export const WorkspacePage: FC<WorkspacePageProps> = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const active = useActiveWorkspace();
  const workspacePath = active?.path ?? null;
  const workspaceId = active?.id ?? null;
  const { data: extraRepoPaths = [] } = useWorkspaceExtraRepoPaths(workspaceId);
  const { data, isLoading, isError, refetch } = useRepositoryList(
    workspacePath,
    extraRepoPaths
  );
  const repos = data ?? [];
  const { query, setQuery, results: visibleRepos } = useRepoSearch(repos);
  const [createOpen, setCreateOpen] = useState(false);
  const { mutate: addExistingRepo } = useAddExistingRepo();

  const handleAddRepo = useCallback((): void => {
    if (!workspaceId) return;
    addExistingRepo(
      { workspaceId },
      {
        onSuccess: (result) => {
          if (!result) return;
          toast.success({
            title: 'Repository added',
            description: basename(result.repoPath)
          });
        },
        onError: (error) => {
          toast.error({
            title: 'Failed to add repository',
            description: error.message
          });
        }
      }
    );
  }, [addExistingRepo, toast, workspaceId]);

  const handleClone = useCallback((): void => {
    navigate('/clone');
  }, [navigate]);

  const handleCreateWorkspace = useCallback((): void => {
    setCreateOpen(true);
  }, []);

  const handleRepoClick = useCallback(
    (repo: Repository): void => {
      navigate(`/repo/${encodeURIComponent(repo.id)}`);
    },
    [navigate]
  );

  if (!active) {
    return (
      <>
        <div className="flex h-full w-full flex-col">
          <NoWorkspaceState onCreate={handleCreateWorkspace} />
        </div>
        <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />
      </>
    );
  }

  return (
    <>
      <div className="flex h-full w-full flex-col gap-4 overflow-y-auto p-6">
        <WorkspaceHeader
          name={active.name}
          path={active.path}
          onAddRepo={handleAddRepo}
          onClone={handleClone}
        />

        <RepoSearchInput value={query} onChange={setQuery} />

        {isLoading ? (
          <div
            className="flex flex-1 items-center justify-center"
            role="status"
            aria-label="Loading repositories"
          >
            <Spinner size="lg" />
          </div>
        ) : isError ? (
          <div className="border-border bg-muted/30 text-foreground flex flex-1 flex-col items-center justify-center gap-3 rounded-md border border-dashed p-8 text-center">
            <h2 className="text-lg font-semibold">Failed to load repositories</h2>
            <p className="text-muted-foreground text-sm">
              Check the workspace folder and try again.
            </p>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                void refetch();
              }}
            >
              Retry
            </Button>
          </div>
        ) : repos.length === 0 ? (
          <NoReposState onAddRepo={handleAddRepo} onClone={handleClone} />
        ) : visibleRepos.length === 0 ? (
          <NoResultsState query={query} onReset={() => setQuery('')} />
        ) : (
          <RepoGrid repos={visibleRepos} onRepoClick={handleRepoClick} />
        )}
      </div>
      <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
};

WorkspacePage.displayName = 'WorkspacePage';
