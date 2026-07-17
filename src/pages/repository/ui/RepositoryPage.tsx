import { useMemo, useState } from 'react';
import type { FC } from 'react';
import { useParams } from 'react-router-dom';

import { useRepository } from '@/entities/repository';
import { useCurrentBranch } from '@/entities/branch';
import { useCommit } from '@/features/commit-changes';
import type { CommitInput } from '@/features/commit-changes';
import { CommitMessageForm } from '@/widgets/commit-message-form';
import type { CommitMessage } from '@/widgets/commit-message-form';
import { CommitGraph } from '@/widgets/commit-graph';
import { FileChangesPanel } from '@/widgets/file-changes-panel';
import { TerminalOutput } from '@/widgets/terminal-output';
import type { TerminalLine } from '@/widgets/terminal-output';
import {
  Empty,
  Panel,
  PanelGroup,
  PanelResizeHandle,
  Spinner
} from '@/shared/ui';
import { cn } from '@/shared/lib/theme';

import { BranchTabsSection } from './BranchTabsSection';
import { RepoHeader } from './RepoHeader';

import type { RepositoryPageProps } from './types';

const decodeRepoId = (id: string | undefined): string | null => {
  if (!id) return null;
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
};

const buildLines = (
  stdout: string,
  stderr: string,
  hash: string
): TerminalLine[] => {
  const out: TerminalLine[] = [];
  const trimmedStdout = stdout.trim();
  const trimmedStderr = stderr.trim();
  if (trimmedStdout) {
    for (const line of trimmedStdout.split('\n')) {
      out.push({ id: `${hash}-stdout-${out.length}`, kind: 'stdout', text: line });
    }
  }
  if (trimmedStderr) {
    for (const line of trimmedStderr.split('\n')) {
      out.push({ id: `${hash}-stderr-${out.length}`, kind: 'stderr', text: line });
    }
  }
  return out;
};

export const RepositoryPage: FC<RepositoryPageProps> = () => {
  const { id } = useParams<{ id: string }>();
  const repoPath = decodeRepoId(id);

  const { data: repo, isLoading: isRepoLoading } = useRepository(repoPath);
  const branchQuery = useCurrentBranch(repoPath);
  const commitMutation = useCommit(repoPath ?? '');

  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);

  const appendLines = useMemo(
    () => (lines: TerminalLine[]) => {
      setTerminalLines((prev) => [...prev, ...lines]);
    },
    []
  );

  const handleCommit = (message: CommitMessage): void => {
    if (!repoPath) return;
    setTerminalLines([]);
    commitMutation.mutate(
      {
        message,
        bypassHooks: false
      } satisfies CommitInput,
      {
        onSuccess: (result) => {
          appendLines(buildLines(result.stdout, result.stderr, result.hash));
          appendLines([
            {
              id: `info-${result.hash}`,
              kind: 'info',
              text: `Committed as ${result.hash.slice(0, 7)}`
            }
          ]);
        },
        onError: (err) => {
          appendLines([
            {
              id: `error-${Date.now()}`,
              kind: 'stderr',
              text: err.message
            }
          ]);
        }
      }
    );
  };

  const handleSelectFile = (path: string): void => {
    appendLines([
      {
        id: `select-${path}-${Date.now()}`,
        kind: 'info',
        text: `Selected ${path}`
      }
    ]);
  };

  const handleCommitClick = (hash: string): void => {
    appendLines([
      {
        id: `commit-${hash}-${Date.now()}`,
        kind: 'info',
        text: `Opened commit ${hash.slice(0, 7)}`
      }
    ]);
  };

  if (!repoPath) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <Empty
          title="No repository selected"
          description="Open a repository from the workspace to get started."
          className="max-w-md"
        />
      </div>
    );
  }

  if (isRepoLoading) {
    return (
      <div
        className="text-muted-foreground flex h-full w-full items-center justify-center gap-2 p-6"
        role="status"
        aria-live="polite"
      >
        <Spinner className="size-4" />
        Loading repository...
      </div>
    );
  }

  const repoName = repo?.name ?? repoPath.split('/').pop() ?? repoPath;
  const repoFullPath = repo?.path ?? repoPath;

  return (
    <div className="flex h-full w-full flex-col">
      <RepoHeader
        name={repoName}
        path={repoFullPath}
        branch={branchQuery.data?.name ?? null}
        isDetached={branchQuery.data?.detached ?? false}
        repoPath={repoPath}
      />

      <div className="min-h-0 flex-1">
        <PanelGroup orientation="vertical" className="h-full">
          <Panel defaultSize={55} minSize={25}>
            <PanelGroup orientation="horizontal" className="h-full">
              <Panel defaultSize={60} minSize={30}>
                <CommitGraph
                  repoPath={repoPath}
                  className="m-2"
                  onCommitClick={handleCommitClick}
                />
              </Panel>
              <PanelResizeHandle />
              <Panel defaultSize={40} minSize={25}>
                <BranchTabsSection repoPath={repoPath} className="h-full p-2" />
              </Panel>
            </PanelGroup>
          </Panel>

          <PanelResizeHandle />

          <Panel defaultSize={45} minSize={20}>
            <PanelGroup orientation="horizontal" className="h-full">
              <Panel defaultSize={55} minSize={30}>
                <div className={cn('flex h-full min-h-0 flex-col gap-2 p-2')}>
                  <FileChangesPanel
                    repoPath={repoPath}
                    onSelectChange={handleSelectFile}
                    className="flex-1"
                  />
                  <div className="bg-card border-border rounded-md border p-4">
                    <CommitMessageForm
                      showBypass
                      showAmend
                      isSubmitting={commitMutation.isPending}
                      onCommit={handleCommit}
                    />
                  </div>
                </div>
              </Panel>
              <PanelResizeHandle />
              <Panel defaultSize={45} minSize={25}>
                <div className={cn('flex h-full min-h-0 flex-col gap-2 p-2')}>
                  <h2 className="text-foreground text-sm font-semibold">Output</h2>
                  <TerminalOutput lines={terminalLines} className="flex-1" />
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

RepositoryPage.displayName = 'RepositoryPage';
