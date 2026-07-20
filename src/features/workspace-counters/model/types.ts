import type { WorkspaceCounters } from '@/app/store';

export type FreshCounters = {
  repoCount: number;
  modifiedCount: number;
  sizeBytes: number | null;
  isLoading: boolean;
};

export type UseWorkspaceCountersResult = {
  counters: WorkspaceCounters | null;
  isReady: boolean;
};
