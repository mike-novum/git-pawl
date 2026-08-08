import type { Commit } from '@electron/shared/types/git';

import type { Branch } from '@/entities/branch';
import type { Tag } from '@/entities/tag';
import type { CommitNode } from '@/widgets/repo-graph-vertical';

const toShortHash = (hash: string): string => hash.slice(0, 7);

export const toCommitNodes = (
  entries: Commit[],
  branches: Branch[],
  tags: Tag[],
  currentBranchName: string | null
): CommitNode[] => {
  const branchesByHash = new Map<string, string[]>();
  const tagsByHash = new Map<string, string[]>();
  const entriesByHash = new Map<string, Commit>();
  const currentTargets = new Set(
    branches
      .filter((branch) => branch.current)
      .map((branch) => branch.target)
      .filter(Boolean)
  );

  entries.forEach((entry) => entriesByHash.set(entry.hash, entry));

  branches.forEach((branch) => {
    for (const commitHash of branch.commits) {
      if (!entriesByHash.has(commitHash)) continue;
      const names = branchesByHash.get(commitHash) ?? [];
      if (!names.includes(branch.name)) {
        names.push(branch.name);
      }
      branchesByHash.set(commitHash, names);
    }
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
