import type { GitRebaseArgs } from '../../../shared/schemas';

import { runGit } from './runner';

export const gitRebase = async (args: GitRebaseArgs): Promise<void> => {
  const { repoPath, onto } = args;
  await runGit(['rebase', onto], repoPath);
};