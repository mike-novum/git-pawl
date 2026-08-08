import { useQuery } from '@tanstack/react-query';
import { GitBranch, RefreshCw } from 'lucide-react';
import { useMemo, useState, type FC } from 'react';
import { useParams } from 'react-router-dom';

import type { Commit } from '@electron/shared/types/git';

import { useCurrentBranch, useBranches, useCheckoutBranch } from '@/entities/branch';
import { useRepository } from '@/entities/repository';
import { useStashList } from '@/entities/stash';
import { useTags } from '@/entities/tag';
import { OpenInFinder } from '@/features/open-in-finder';
import { OpenInTerminal } from '@/features/open-in-terminal';
import { PullButton } from '@/features/git-pull';
import { PushButton } from '@/features/git-push';
import { toCommitNodes } from '@/pages/repository';
import { gitLog } from '@/shared/api';
import { Empty, Spinner, useToast } from '@/shared/ui';
import { RepoDetailPanel } from '@/widgets/repo-detail-panel';
import { computeLayout, RepoGraph } from '@/widgets/repo-graph-vertical';
import { RepoTree } from '@/widgets/repo-tree';

const decodeRepoId = (id: string | undefined): string | null => {
  if (!id) return null;
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
};

export const RepositoryPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const repoPath = decodeRepoId(id);
  const toast = useToast();

  const { data: repo, isLoading: isRepoLoading } = useRepository(repoPath);
  const branchQuery = useCurrentBranch(repoPath);
  const { data: branches = [] } = useBranches(repoPath);
  const { data: tags = [] } = useTags(repoPath);
  const { data: stash = [] } = useStashList(repoPath);
  const checkoutMutation = useCheckoutBranch();

  const logQuery = useQuery({
    queryKey: ['git-log', repoPath],
    queryFn: () => gitLog({ repoPath: repoPath as string, maxCount: 100 }),
    enabled: !!repoPath
  });

  const commits = useMemo(
    () =>
      Array.isArray(logQuery.data)
        ? toCommitNodes(
            logQuery.data as Commit[],
            branches,
            tags,
            branchQuery.data?.name ?? null
          )
        : [],
    [branches, branchQuery.data, logQuery.data, tags]
  );
  const commitLayout = useMemo(
    () => computeLayout(commits),
    [commits]
  );

  const [selectedHash, setSelectedHash] = useState<string | null>(null);

  if (!repoPath) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Empty
          title="No repository selected"
          description="Open a repository from a workspace."
        />
      </div>
    );
  }

  if (isRepoLoading) {
    return (
      <div className="text-muted-foreground flex h-full items-center justify-center gap-2">
        <Spinner className="size-4" /> Loading repository...
      </div>
    );
  }

  const repoName = repo?.name ?? repoPath.split('/').pop() ?? repoPath;
  const ahead = branches.reduce((sum, b) => sum + (b.upstream?.ahead ?? 0), 0);
  const behind = branches.reduce((sum, b) => sum + (b.upstream?.behind ?? 0), 0);

  const selectedCommit =
    commitLayout.rows.find((row) => row.commit.hash === selectedHash)?.commit ??
    null;

  const handleCopyHash = (hash: string): void => {
    void navigator.clipboard
      .writeText(hash)
      .then(() => {
        toast.success({ title: 'Hash copied' });
      })
      .catch(() => {
        toast.error({ title: 'Failed to copy hash' });
      });
  };

  const handleSwitchBranch = (branchName: string): void => {
    checkoutMutation.mutate({ repoPath, ref: branchName });
  };

  return (
    <div className="flex h-full w-full flex-col">
      <header className="border-border bg-surface flex h-14 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-3">
          <div className="bg-surface-elevated text-primary flex size-9 items-center justify-center rounded-md">
            <GitBranch aria-hidden="true" className="size-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-foreground text-base font-semibold leading-tight">
              {repoName}
            </h1>
            <div className="text-muted-foreground flex items-center gap-2 font-mono text-xs">
              <span>{branchQuery.data?.name ?? 'detached'}</span>
              {ahead > 0 || behind > 0 ? (
                <span className={behind > 0 ? 'text-warning' : 'text-success'}>
                  ↑{ahead} ↓{behind}
                </span>
              ) : null}
              <span>
                {branches.length} branches · {tags.length} tags · {stash.length} stash
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <OpenInFinder path={repoPath} />
          <OpenInTerminal path={repoPath} />
          <button
            type="button"
            aria-label="Fetch"
            onClick={() =>
              toast.info({
                title: 'Coming soon',
                description: 'Fetch is not implemented yet'
              })
            }
            className="text-muted-foreground hover:bg-surface-elevated hover:text-foreground flex size-8 items-center justify-center rounded-md transition-colors"
          >
            <RefreshCw aria-hidden="true" className="size-4" />
          </button>
          <PullButton
            repoPath={repoPath}
            branchName={branchQuery.data?.name ?? undefined}
            variant="primary"
          />
          <PushButton
            repoPath={repoPath}
            branchName={branchQuery.data?.name ?? undefined}
            variant="primary"
          />
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <RepoTree
          repoPath={repoPath}
          selectedCommit={selectedHash}
          onSelectCommit={setSelectedHash}
          onSwitchBranch={handleSwitchBranch}
        />
        <RepoGraph
          commits={commits}
          layout={commitLayout}
          selectedHash={selectedHash}
          onSelect={setSelectedHash}
          isLoading={logQuery.isLoading}
          isError={logQuery.isError}
          className="flex-1"
        />
        <RepoDetailPanel
          commit={selectedCommit}
          onCopyHash={handleCopyHash}
          onCreatePatch={() =>
            toast.info({ title: 'Coming soon', description: 'Patch is not implemented yet' })
          }
          onRevert={() =>
            toast.info({ title: 'Coming soon', description: 'Revert is not implemented yet' })
          }
          onCherryPick={() =>
            toast.info({
              title: 'Coming soon',
              description: 'Cherry-pick is not implemented yet'
            })
          }
          onResetToHere={() =>
            toast.info({
              title: 'Coming soon',
              description: 'Reset to here is not implemented yet'
            })
          }
          uncommittedCount={repo?.status === 'dirty' ? 1 : 0}
          onCommit={() =>
            toast.info({
              title: 'Coming soon',
              description: 'Open commit is not implemented yet'
            })
          }
          onStash={() =>
            toast.info({ title: 'Coming soon', description: 'Stash is not implemented yet' })
          }
          onDiscard={() =>
            toast.info({
              title: 'Coming soon',
              description: 'Discard is not implemented yet'
            })
          }
        />
      </div>
    </div>
  );
};

RepositoryPage.displayName = 'RepositoryPage';
