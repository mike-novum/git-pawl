import type { Branch, BranchMainline, CurrentBranchInfo } from '../model/types';

import {
  fetchBranches,
  fetchBranchMainlines,
  fetchCurrentBranch
} from '../api';

export const branchListQueryKey = (
  repoPath: string
): readonly [string, string] => ['branch-list', repoPath] as const;

export const branchMainlineQueryKey = (
  repoPath: string
): readonly [string, string] => ['branch-mainlines', repoPath] as const;

export const currentBranchQueryKey = (
  repoPath: string
): readonly [string, string] => ['current-branch', repoPath] as const;

export const fetchBranchList = async (
  repoPath: string,
  signal?: AbortSignal
): Promise<Branch[]> => fetchBranches(repoPath, signal);

export const fetchBranchMainlinesList = async (
  repoPath: string,
  signal?: AbortSignal
): Promise<BranchMainline[]> => fetchBranchMainlines(repoPath, signal);

export const fetchBranchCurrent = async (
  repoPath: string,
  signal?: AbortSignal
): Promise<CurrentBranchInfo> => fetchCurrentBranch(repoPath, signal);
