import { promises as fs } from 'node:fs';
import path from 'node:path';

import type { GitStatus } from '@electron/shared/types/git';

import { fsScanRepos, gitStatus } from '@/shared/api';

export type WorkspaceStatus = 'clean' | 'warning' | 'danger' | 'unknown';

const CACHE_TTL_MS = 30 * 1000;

type CacheEntry = { status: WorkspaceStatus; scannedAt: number };

const cache = new Map<string, CacheEntry>();

export const invalidateWorkspaceStatus = (workspacePath: string): void => {
  cache.delete(workspacePath);
};

export const getCachedWorkspaceStatus = async (
  workspacePath: string
): Promise<CacheEntry> => {
  const cached = cache.get(workspacePath);
  if (cached && Date.now() - cached.scannedAt < CACHE_TTL_MS) {
    return cached;
  }

  const repoPaths = await fsScanRepos({ path: workspacePath, maxDepth: 1 });

  const concurrency = 4;
  let cursor = 0;
  let status: WorkspaceStatus = 'clean';

  const workers = Array.from({ length: concurrency }, async () => {
    while (cursor < repoPaths.length && status !== 'danger') {
      const idx = cursor++;
      const repoPath = repoPaths[idx];
      try {
        await fs.access(path.join(repoPath, '.git'));
      } catch {
        status = 'danger';
        return;
      }
      try {
        const result = (await gitStatus({ repoPath })) as GitStatus | null;
        if (result && result.clean === false) {
          if (status === 'clean') status = 'warning';
        }
      } catch {
        if (status === 'clean') status = 'warning';
      }
    }
  });

  await Promise.all(workers);

  const entry: CacheEntry = { status, scannedAt: Date.now() };
  cache.set(workspacePath, entry);
  return entry;
};
