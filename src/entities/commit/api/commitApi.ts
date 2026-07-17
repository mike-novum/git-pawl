import type { Commit } from '@electron/shared/types/git';

import { gitLog } from '@/shared/api';

export type { Commit };

export type CommitListOptions = {
  maxCount?: number;
};

export const getCommitList = (
  repoPath: string,
  options: CommitListOptions = {}
): Promise<Commit[]> => {
  const args: { repoPath: string; maxCount?: number } = { repoPath };
  if (typeof options.maxCount === 'number') {
    args.maxCount = options.maxCount;
  }
  return gitLog(args) as Promise<Commit[]>;
};
