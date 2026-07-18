import { useQuery } from '@tanstack/react-query';
import { GitBranch, GitPullRequestArrow, RefreshCw } from 'lucide-react';
import { useState, type FC } from 'react';
import { useParams } from 'react-router-dom';

import type { Commit } from '@electron/shared/types/git';

import { useCurrentBranch, useBranches } from '@/entities/branch';
import { useRepository } from '@/entities/repository';
import { useStashList } from '@/entities/stash';
import { useTags } from '@/entities/tag';
import { gitLog } from '@/shared/api';
import { Empty, Spinner, useToast } from '@/shared/ui';
import { RepoDetailPanel } from '@/widgets/repo-detail-panel';
import { RepoGraph } from '@/widgets/repo-graph-vertical';
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

const toCommitNodes = (entries: Commit[]): CommitNode[] => {
  const allHashes = new Set(entries.map((e) => e.hash));
  const laneHeads: (string | null)[] = [];

  return entries.map((e) => {
    let lane = laneHeads.findIndex(
      (head) => head !== null && e.parents.includes(head)
    );

    if (lane === -1) {
      lane = laneHeads.findIndex((head) => head === null);
      if (lane === -1) {
        lane = laneHeads.length;
        laneHeads.push(null);
      }
    }

    const nextParent = e.parents.find((p) => allHashes.has(p));
    laneHeads[lane] = nextParent ?? null;

    return {
      hash: e.hash,
      shortHash: toShortHash(e.hash),
      subject: e.subject,
      author: e.author.name,
      timestamp: e.date,
      parents: e.parents,
      lane
    };
  });
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

  const commits = Array.isArray(logQuery.data)
    ? toCommitNodes(logQuery.data as Commit[])
    : [];

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

  const selectedCommit = commits.find((c) => c.hash === selectedHash) ?? null;

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
            className="text-muted-foreground hover:bg-surface-elevated hover:text-foreground flex size-8 items-center justify-center rounded-md transition-colors"
          >
            <RefreshCw aria-hidden="true" className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Pull"
            className="bg-primary text-primary-foreground hover:shadow-glow flex h-8 items-center gap-1.5 rounded-md px-3 text-xs transition-all"
          >
            <GitPullRequestArrow aria-hidden="true" className="size-3.5" /> Pull
          </button>
          <button
            type="button"
            aria-label="Push"
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
          selectedHash={selectedHash}
          onSelect={setSelectedHash}
          className="flex-1"
        />
        <RepoDetailPanel
          commit={selectedCommit}
          onCopyHash={handleCopyHash}
          onCreatePatch={() => toast.info({ title: 'Patch' })}
          onRevert={() => toast.info({ title: 'Revert' })}
          onCherryPick={() => toast.info({ title: 'Cherry-pick' })}
          onResetToHere={() => toast.info({ title: 'Reset to here' })}
          uncommittedCount={repo?.status === 'dirty' ? 1 : 0}
          onCommit={() => toast.info({ title: 'Open commit' })}
          onStash={() => toast.info({ title: 'Stash' })}
          onDiscard={() => toast.info({ title: 'Discard' })}
        />
      </div>
    </div>
  );
};

RepositoryPage.displayName = 'RepositoryPage';
