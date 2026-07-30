import { useQuery } from '@tanstack/react-query';
import { GitBranch, GitPullRequestArrow, RefreshCw } from 'lucide-react';
import { useMemo, useState, type FC } from 'react';
import { useParams } from 'react-router-dom';

import type { Commit } from '@electron/shared/types/git';

import { useCurrentBranch, useBranches } from '@/entities/branch';
import type { Branch } from '@/entities/branch';
import { useRepository } from '@/entities/repository';
import { useStashList } from '@/entities/stash';
import { useTags } from '@/entities/tag';
import type { Tag } from '@/entities/tag';
import { gitLog } from '@/shared/api';
import { Empty, Spinner, useToast } from '@/shared/ui';
import { RepoDetailPanel } from '@/widgets/repo-detail-panel';
import { computeLayout, RepoGraph } from '@/widgets/repo-graph-vertical';
import type { CommitNode } from '@/widgets/repo-graph-vertical';
import { RepoTree } from '@/widgets/repo-tree';

const decodeRepoId = (id: string | undefined): string | null => {
  if (!id) return null;
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
};

const toShortHash = (hash: string): string => hash.slice(0, 7);

const toCommitNodes = (
  entries: Commit[],
  branches: Branch[],
  tags: Tag[],
  currentBranchName: string | null
): CommitNode[] => {
  const branchesByHash = new Map<string, string[]>();
  const tagsByHash = new Map<string, string[]>();
  const currentTargets = new Set(
    branches
      .filter((branch) => branch.current)
      .map((branch) => branch.target)
      .filter(Boolean)
  );

  branches.forEach((branch) => {
    const names = branchesByHash.get(branch.target) ?? [];
    names.push(branch.name);
    branchesByHash.set(branch.target, names);
  });

  tags.forEach((tag) => {
    const names = tagsByHash.get(tag.target) ?? [];
    names.push(tag.name);
    tagsByHash.set(tag.target, names);
  });

  return entries.map((entry) => ({
    hash: entry.hash,
    shortHash: toShortHash(entry.hash),
    subject: entry.subject,
    author: entry.author.name,
    authorEmail: entry.author.email,
    timestamp: entry.date,
    parents: entry.parents,
    lane: 0,
    branches: branchesByHash.get(entry.hash),
    tags: tagsByHash.get(entry.hash),
    currentBranchName: currentBranchName ?? undefined,
    isCurrentBranch: currentTargets.has(entry.hash)
  }));
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
  const commitLayout = useMemo(() => computeLayout(commits), [commits]);

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
          <button
            type="button"
            aria-label="Pull"
            onClick={() =>
              toast.info({ title: 'Coming soon', description: 'Pull is not implemented yet' })
            }
            className="bg-primary text-primary-foreground hover:shadow-glow flex h-8 items-center gap-1.5 rounded-md px-3 text-xs transition-all"
          >
            <GitPullRequestArrow aria-hidden="true" className="size-3.5" /> Pull
          </button>
          <button
            type="button"
            aria-label="Push"
            onClick={() =>
              toast.info({ title: 'Coming soon', description: 'Push is not implemented yet' })
            }
            className="bg-primary text-primary-foreground hover:shadow-glow flex h-8 items-center gap-1.5 rounded-md px-3 text-xs transition-all"
          >
            <GitPullRequestArrow aria-hidden="true" className="size-3.5 -scale-y-100" /> Push
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <RepoTree
          repoPath={repoPath}
          selectedCommit={selectedHash}
          onSelectCommit={setSelectedHash}
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
