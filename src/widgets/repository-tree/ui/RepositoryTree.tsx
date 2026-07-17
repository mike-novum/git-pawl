import type { FC } from 'react';

import { RepositoryCard, useRepositoryList } from '@/entities/repository';
import { cn } from '@/shared/lib/theme';
import { Empty } from '@/shared/ui/empty';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  ResizablePanel
} from '@/shared/ui/resizable-panel';
import {
  ScrollAreaRoot,
  ScrollAreaViewport
} from '@/shared/ui/scroll-area';
import { Spinner } from '@/shared/ui/spinner';

import type { RepositoryTreeProps } from './types';

const DEFAULT_SIZES: [number, number] = [25, 75];
const MIN_LEFT_SIZE = 15;
const MIN_RIGHT_SIZE = 30;

export const RepositoryTree: FC<RepositoryTreeProps> = ({
  workspacePath,
  selectedRepoId,
  onSelect,
  className
}) => {
  const { data: repos = [], isLoading, isError } = useRepositoryList(workspacePath);

  return (
    <ResizablePanel.Root className={cn('h-full w-full', className)}>
      <PanelGroup orientation="horizontal">
        <Panel
          id="repository-tree-list"
          defaultSize={DEFAULT_SIZES[0]}
          minSize={MIN_LEFT_SIZE}
          className="border-r border-border bg-card"
        >
          <ScrollAreaRoot className="h-full">
            <ScrollAreaViewport className="h-full">
              {isLoading ? (
                <div
                  className="text-muted-foreground flex h-full items-center justify-center gap-2 p-6 text-sm"
                  role="status"
                  aria-live="polite"
                >
                  <Spinner className="size-4" />
                  Loading repositories...
                </div>
              ) : isError ? (
                <Empty
                  title="Failed to load repositories"
                  description="Check workspace path and try again."
                  className="m-4"
                />
              ) : repos.length === 0 ? (
                <Empty
                  title="No repositories"
                  description={
                    workspacePath
                      ? 'No git repositories found in this workspace.'
                      : 'Select a workspace to see its repositories.'
                  }
                  className="m-4"
                />
              ) : (
                <ul className="flex flex-col gap-2 p-3">
                  {repos.map((repo) => {
                    const isSelected = repo.id === selectedRepoId;
                    return (
                      <li key={repo.id}>
                        <div
                          className={cn(
                            'rounded-lg border transition-colors',
                            isSelected
                              ? 'border-primary bg-primary/10'
                              : 'border-transparent'
                          )}
                        >
                          <RepositoryCard
                            repo={repo}
                            onClick={onSelect ? () => onSelect(repo.id) : undefined}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </ScrollAreaViewport>
          </ScrollAreaRoot>
        </Panel>

        <PanelResizeHandle aria-label="Resize repository content" />

        <Panel
          id="repository-tree-content"
          defaultSize={DEFAULT_SIZES[1]}
          minSize={MIN_RIGHT_SIZE}
          className="bg-background"
        >
          <div className="text-muted-foreground flex h-full items-center justify-center p-6 text-sm">
            Select a repository
          </div>
        </Panel>
      </PanelGroup>
    </ResizablePanel.Root>
  );
};

RepositoryTree.displayName = 'RepositoryTree';
