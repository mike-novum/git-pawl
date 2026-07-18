import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/api', () => ({
  fsWorkspaceSize: vi.fn()
}));

import { fsWorkspaceSize } from '@/shared/api';

import {
  clearWorkspaceSizeCache,
  getCachedSize,
  invalidateWorkspaceSize
} from './workspaceSizeCache';

const fsWorkspaceSizeMock = vi.mocked(fsWorkspaceSize);

describe('workspaceSizeCache', () => {
  beforeEach(() => {
    fsWorkspaceSizeMock.mockReset();
    clearWorkspaceSizeCache();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls fsWorkspaceSize once and caches the result', async () => {
    fsWorkspaceSizeMock.mockResolvedValue({ totalBytes: 1024 });

    const first = await getCachedSize('/work/a');
    const second = await getCachedSize('/work/a');

    expect(first.totalBytes).toBe(1024);
    expect(second).toEqual(first);
    expect(fsWorkspaceSizeMock).toHaveBeenCalledTimes(1);
    expect(fsWorkspaceSizeMock).toHaveBeenCalledWith({ workspacePath: '/work/a' });
  });

  it('dedupes concurrent calls for the same path', async () => {
    let resolveFn: (value: { totalBytes: number }) => void = () => {};
    fsWorkspaceSizeMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFn = resolve;
        })
    );

    const pendingA = getCachedSize('/work/b');
    const pendingB = getCachedSize('/work/b');

    resolveFn({ totalBytes: 4096 });
    const [a, b] = await Promise.all([pendingA, pendingB]);

    expect(a.totalBytes).toBe(4096);
    expect(b.totalBytes).toBe(4096);
    expect(fsWorkspaceSizeMock).toHaveBeenCalledTimes(1);
  });

  it('uses separate cache entries for different paths', async () => {
    fsWorkspaceSizeMock.mockImplementation(async ({ workspacePath }) => ({
      totalBytes: workspacePath === '/work/x' ? 100 : 200
    }));

    const a = await getCachedSize('/work/x');
    const b = await getCachedSize('/work/y');

    expect(a.totalBytes).toBe(100);
    expect(b.totalBytes).toBe(200);
    expect(fsWorkspaceSizeMock).toHaveBeenCalledTimes(2);
  });

  it('refreshes after TTL expires', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));

    fsWorkspaceSizeMock.mockResolvedValueOnce({ totalBytes: 10 });
    const first = await getCachedSize('/work/t');
    expect(first.totalBytes).toBe(10);

    fsWorkspaceSizeMock.mockResolvedValueOnce({ totalBytes: 20 });
    vi.setSystemTime(new Date('2026-01-01T00:05:01Z'));
    const second = await getCachedSize('/work/t');

    expect(second.totalBytes).toBe(20);
    expect(fsWorkspaceSizeMock).toHaveBeenCalledTimes(2);
  });

  it('invalidateWorkspaceSize forces a refetch on next call', async () => {
    fsWorkspaceSizeMock.mockResolvedValueOnce({ totalBytes: 5 });
    const first = await getCachedSize('/work/i');
    expect(first.totalBytes).toBe(5);

    invalidateWorkspaceSize('/work/i');

    fsWorkspaceSizeMock.mockResolvedValueOnce({ totalBytes: 7 });
    const second = await getCachedSize('/work/i');
    expect(second.totalBytes).toBe(7);
    expect(fsWorkspaceSizeMock).toHaveBeenCalledTimes(2);
  });
});
