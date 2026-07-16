import type { GitResetArgs } from '../../../shared/schemas';

import { runGit } from './runner';

export const gitReset = async (args: GitResetArgs): Promise<void> => {
  const gitArgs = ['reset', `--${args.mode}`];
  if (args.ref) {
    gitArgs.push(args.ref);
  }
  await runGit(gitArgs, args.repoPath);
};