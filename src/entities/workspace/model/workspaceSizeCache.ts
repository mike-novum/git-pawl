import { fsWorkspaceSize } from '@/shared/api';

const TTL_MS = 5 * 60 * 1000;

type Entry = { totalBytes: number; scannedAt: number };

const cache = new Map<string, Entry>();
const inflight = new Map<string, Promise<Entry>>();

export const getCachedSize = async (workspacePath: string): Promise<Entry> => {
  const now = Date.now();
  const cached = cache.get(workspacePath);
  if (cached && now - cached.scannedAt < TTL_MS) {
    return cached;
  }
  const pending = inflight.get(workspacePath);
  if (pending) return pending;

  const promise = (async (): Promise<Entry> => {
    const result = await fsWorkspaceSize({ workspacePath });
    const entry: Entry = { totalBytes: result.totalBytes, scannedAt: Date.now() };
    cache.set(workspacePath, entry);
    inflight.delete(workspacePath);
    return entry;
  })();
  inflight.set(workspacePath, promise);
  return promise;
};

export const invalidateWorkspaceSize = (workspacePath: string): void => {
  cache.delete(workspacePath);
};

export const clearWorkspaceSizeCache = (): void => {
  cache.clear();
};
