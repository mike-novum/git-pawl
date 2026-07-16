import type { GitRevertArgs } from '../../../shared/schemas';

import { runGit } from './runner';

export const gitRevert = async (args: GitRevertArgs): Promise<void> => {
  const gitArgs = ['revert'];
  if (args.noEdit) {
    gitArgs.push('--no-edit');
  }
  gitArgs.push(args.commit);
  await runGit(gitArgs, args.repoPath);
};