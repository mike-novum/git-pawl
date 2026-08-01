import type { BranchListResult } from '../../../shared/types/git';
import type { GitBranchArgs } from '../../../shared/schemas';

import { runGit } from './runner';

export type GitBranchResult = BranchListResult | void;

const requireName = (name: string | undefined, action: string): string => {
  if (!name) {
    throw new Error(`name is required for branch ${action}`);
  }
  return name;
};

export const parseBranchRefs = (raw: string): BranchListResult =>
  raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const [name = '', target = ''] = line.split('\0');

      return { name, target, commits: [] };
    })
    .filter((branch) => branch.name.length > 0 && branch.target.length > 0);

export const parseRevList = (raw: string): string[] =>
  raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

const fetchBranchCommits = async (
  repoPath: string,
  branchName: string
): Promise<string[]> => {
  const { stdout } = await runGit(['rev-list', branchName], repoPath);
  return parseRevList(stdout);
};

export const gitBranch = async (args: GitBranchArgs): Promise<GitBranchResult> => {
  if (args.action === 'list') {
    const { stdout } = await runGit(
      ['branch', '--format=%(refname:short)%00%(objectname)'],
      args.repoPath
    );
    const branches = parseBranchRefs(stdout);
    const commitsLists = await Promise.all(
      branches.map((branch) => fetchBranchCommits(args.repoPath, branch.name))
    );
    return branches.map((branch, index) => ({
      ...branch,
      commits: commitsLists[index] ?? []
    }));
  }

  if (args.action === 'create') {
    const name = requireName(args.name, 'create');
    await runGit(['branch', name], args.repoPath);
    return;
  }

  const name = requireName(args.name, 'delete');
  const flag = args.force ? '-D' : '-d';
  await runGit(['branch', flag, name], args.repoPath);
  return;
};
