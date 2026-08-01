import { Plus } from 'lucide-react';
import { useCallback, useState, type FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { CreateWorkspaceDialog } from '@/features/workspace-create';
import {
  useWorkspaceIcon,
  useWorkspaceList,
  useWorkspaceSize,
  useWorkspaceStatus,
  type Workspace
} from '@/entities/workspace';
import { useRepositoryList } from '@/entities/repository';
import { Button, Spinner } from '@/shared/ui';

import { EmptyWorkspaces } from './EmptyWorkspaces';
import { NewWorkspaceTile } from './NewWorkspaceTile';
import { RecentActivity } from './RecentActivity';
import { WorkspaceTile } from './WorkspaceTile';

import type { RecentActivityItem } from './RecentActivity';

export const WorkspacesPage: FC = () => {
  const navigate = useNavigate();
  const { data: workspaces = [], isLoading } = useWorkspaceList();
  const [createOpen, setCreateOpen] = useState(false);

  const handleCreate = useCallback((): void => {
    setCreateOpen(true);
  }, []);

  const handleOpen = useCallback(
    (id: string) => (): void => {
      navigate(`/workspaces/${id}`);
    },
    [navigate]
  );

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center" role="status">
        <Spinner size="lg" />
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <>
        <EmptyWorkspaces onCreate={handleCreate} />
        <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />
      </>
    );
  }

  const activityItems: RecentActivityItem[] = [];

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-8">
        <header className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">
              Workspaces
            </h1>
            <p className="text-muted-foreground text-sm">
              {workspaces.length}{' '}
              {workspaces.length === 1 ? 'workspace' : 'workspaces'}
            </p>
          </div>
          <Button type="button" onClick={handleCreate}>
            <Plus aria-hidden="true" className="size-4" />
            New
          </Button>
        </header>

        <section
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
        >
          {workspaces.map((ws) => (
            <WorkspaceTileWrapper
              key={ws.id}
              workspace={ws}
              onOpen={handleOpen(ws.id)}
            />
          ))}
          <NewWorkspaceTile onClick={handleCreate} />
        </section>

        <RecentActivity items={activityItems} />
      </div>
      <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
};

const WorkspaceTileWrapper: FC<{
  workspace: Workspace;
  onOpen: () => void;
}> = ({ workspace, onOpen }) => {
  const { data: repos = [], isPending: isReposPending } = useRepositoryList(workspace.path, []);
  const { totalBytes, isLoading: isSizeLoading } = useWorkspaceSize(workspace.path);
  const { status, isLoading: isStatusLoading } = useWorkspaceStatus(workspace.path);
  const { data: iconPath = null } = useWorkspaceIcon(workspace.id);

  const lastActivity: number | null = null;
  const isLoading = isReposPending || isSizeLoading || isStatusLoading;

  return (
    <WorkspaceTile
      workspace={workspace}
      iconPath={iconPath}
      repoCount={isReposPending ? null : repos.length}
      sizeBytes={totalBytes}
      status={isStatusLoading ? 'unknown' : status}
      lastActivity={lastActivity}
      isLoading={isLoading}
      onOpen={onOpen}
    />
  );
};

WorkspaceTileWrapper.displayName = 'WorkspaceTileWrapper';

WorkspacesPage.displayName = 'WorkspacesPage';
