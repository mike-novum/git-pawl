import type { CommitResult } from '../../../shared/types/git';
import type { GitAmendArgs } from '../../../shared/schemas';

import { parseCommitHash, runGit } from './runner';

export const gitAmend = async (args: GitAmendArgs): Promise<CommitResult> => {
  const gitArgs = ['commit', '--amend'];
  if (args.noVerify) {
    gitArgs.push('--no-verify');
  }
  if (args.message) {
    gitArgs.push('-m', args.message);
  }

  const { stdout, stderr } = await runGit(gitArgs, args.repoPath);

  const hashResult = await runGit(['rev-parse', 'HEAD'], args.repoPath);
  const hash = parseCommitHash(hashResult.stdout);

  return { hash, stdout, stderr };
};