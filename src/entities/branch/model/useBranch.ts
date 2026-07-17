import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type {
  Branch,
  CurrentBranchInfo
} from './types';
import {
  branchListQueryKey,
  currentBranchQueryKey,
  fetchBranchCurrent,
  fetchBranchList
} from './branchQueries';

const DISABLED_LIST_KEY = ['branch-list', 'disabled'] as const;
const DISABLED_CURRENT_KEY = ['current-branch', 'disabled'] as const;

export const useBranches = (
  repoPath: string | null
): UseQueryResult<Branch[]> =>
  useQuery({
    queryKey: repoPath ? branchListQueryKey(repoPath) : DISABLED_LIST_KEY,
    queryFn: ({ signal }) =>
      repoPath ? fetchBranchList(repoPath, signal) : Promise.resolve([]),
    enabled: Boolean(repoPath)
  });

export const useCurrentBranch = (
  repoPath: string | null
): UseQueryResult<CurrentBranchInfo> =>
  useQuery({
    queryKey: repoPath ? currentBranchQueryKey(repoPath) : DISABLED_CURRENT_KEY,
    queryFn: ({ signal }) =>
      repoPath
        ? fetchBranchCurrent(repoPath, signal)
        : Promise.resolve<CurrentBranchInfo>({
            name: null,
            detached: false
          }),
    enabled: Boolean(repoPath)
  });
