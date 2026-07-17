import type { Branch, CurrentBranchInfo } from '../model/types';

import { fetchBranches, fetchCurrentBranch } from '../api';

export const branchListQueryKey = (
  repoPath: string
): readonly [string, string] => ['branch-list', repoPath] as const;

export const currentBranchQueryKey = (
  repoPath: string
): readonly [string, string] => ['current-branch', repoPath] as const;

export const fetchBranchList = async (
  repoPath: string,
  signal?: AbortSignal
): Promise<Branch[]> => fetchBranches(repoPath, signal);

export const fetchBranchCurrent = async (
  repoPath: string,
  signal?: AbortSignal
): Promise<CurrentBranchInfo> => fetchCurrentBranch(repoPath, signal);
