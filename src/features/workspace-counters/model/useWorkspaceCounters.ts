import { useEffect } from 'react';

import { useAppStore, type WorkspaceCounters } from '@/app/store';

import type { FreshCounters, UseWorkspaceCountersResult } from './types';

export const useWorkspaceCounters = (
  workspaceId: string | null,
  fresh: FreshCounters
): UseWorkspaceCountersResult => {
  const stored = useAppStore((state) =>
    workspaceId ? (state.workspaceCounters[workspaceId] ?? null) : null
  );
  const setWorkspaceCounters = useAppStore((state) => state.setWorkspaceCounters);

  const hasFreshData = !fresh.isLoading;
  const sizeBytes = fresh.sizeBytes ?? stored?.sizeBytes ?? null;

  useEffect(() => {
    if (!workspaceId || !hasFreshData) return;

    setWorkspaceCounters(workspaceId, {
      repoCount: fresh.repoCount,
      modifiedCount: fresh.modifiedCount,
      sizeBytes,
      updatedAt: Date.now()
    });
  }, [
    workspaceId,
    hasFreshData,
    fresh.repoCount,
    fresh.modifiedCount,
    sizeBytes,
    setWorkspaceCounters
  ]);

  const counters: WorkspaceCounters | null = hasFreshData
    ? {
        repoCount: fresh.repoCount,
        modifiedCount: fresh.modifiedCount,
        sizeBytes,
        updatedAt: stored?.updatedAt ?? 0
      }
    : stored;

  return {
    counters,
    isReady: hasFreshData || stored !== null
  };
};
