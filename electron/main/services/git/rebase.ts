import type { GitRebaseArgs } from '../../../shared/schemas';

import { runGit } from './runner';

export const gitRebase = async (args: GitRebaseArgs): Promise<void> => {
  const { repoPath, onto, branch } = args;
  await runGit(['rebase', branch ?? onto ?? ''], repoPath);
};