import type { GitCheckoutArgs } from '../../../shared/schemas';

import { runGit } from './runner';

export const gitCheckout = async (args: GitCheckoutArgs): Promise<void> => {
  const gitArgs = ['checkout'];
  if (args.create) {
    gitArgs.push('-b');
  }
  gitArgs.push(args.ref);
  await runGit(gitArgs, args.repoPath);
};