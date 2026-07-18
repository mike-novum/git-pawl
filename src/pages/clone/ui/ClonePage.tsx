import { useCallback } from 'react';
import type { FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useActiveWorkspace } from '@/entities/workspace';

import { CloneByUrlForm } from '@/features/clone-repo';

import type { ClonePageProps } from '../types';

export const ClonePage: FC<ClonePageProps> = () => {
  const workspace = useActiveWorkspace();
  const navigate = useNavigate();

  const handleCloneSuccess = useCallback((): void => {
    navigate('/workspace');
  }, [navigate]);

  return (
    <div className="flex h-full w-full flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-foreground text-2xl font-semibold">Clone</h1>
      </header>

      <section className="border-border bg-card flex max-w-2xl flex-col gap-4 rounded-lg border p-5">
        <header className="flex flex-col gap-1">
          <h2 className="text-foreground text-base font-semibold">
            Clone a repository
          </h2>
          <p className="text-muted-foreground text-xs">
            Paste a public repository URL. The destination folder defaults to
            the active workspace.
          </p>
        </header>

        <CloneByUrlForm
          activeWorkspace={
            workspace
              ? { id: workspace.id, name: workspace.name, path: workspace.path }
              : null
          }
          onSuccess={handleCloneSuccess}
        />

        {!workspace && (
          <p className="text-muted-foreground text-xs">
            No active workspace selected.{' '}
            <Link
              to="/workspace"
              className="text-primary underline-offset-4 hover:underline"
            >
              Open workspaces
            </Link>
            {' '}to pick or create one.
          </p>
        )}
      </section>
    </div>
  );
};
