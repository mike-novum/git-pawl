import type { FC } from 'react';

import { useRepositoryList } from '@/entities/repository';
import {
  useWorkspaceById,
  useWorkspaceExtraRepoPaths
} from '@/entities/workspace';
import { WorkspaceTotalSize } from '@/features/total-size';
import { Badge } from '@/shared/ui';

import type { WorkspaceHeaderMetaProps } from './types';

export const WorkspaceHeaderMeta: FC<WorkspaceHeaderMetaProps> = ({ workspaceId }) => {
  const workspace = useWorkspaceById(workspaceId);
  const workspacePath = workspace?.path ?? null;
  const { data: extraRepoPaths = [] } = useWorkspaceExtraRepoPaths(workspaceId);
  const { data: repos = [] } = useRepositoryList(workspacePath, extraRepoPaths);

  if (!workspacePath) return null;

  const repoCount = repos.length;
  const modifiedCount = repos.filter((repo) => repo.status === 'dirty').length;

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span
        className="text-muted-foreground truncate font-mono text-xs"
        title={workspacePath}
      >
        {workspacePath}
      </span>

      <Badge variant="outline" size="sm">
        {repoCount} {repoCount === 1 ? 'repo' : 'repos'}
      </Badge>

      {modifiedCount > 0 ? (
        <Badge variant="outline" size="sm">
          {modifiedCount} modified
        </Badge>
      ) : null}

      <WorkspaceTotalSize workspacePath={workspacePath} />
    </div>
  );
};

WorkspaceHeaderMeta.displayName = 'WorkspaceHeaderMeta';
