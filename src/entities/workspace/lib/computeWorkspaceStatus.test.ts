// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/api', () => ({
  fsScanRepos: vi.fn(),
  gitStatus: vi.fn()
}));

vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>();
  return {
    ...actual,
    promises: {
      ...actual.promises,
      access: vi.fn()
    }
  };
});

import { promises as fs } from 'node:fs';

import { fsScanRepos, gitStatus } from '@/shared/api';

import { getCachedWorkspaceStatus } from './computeWorkspaceStatus';

const fsScanReposMock = vi.mocked(fsScanRepos);
const gitStatusMock = vi.mocked(gitStatus);
const fsAccessMock = vi.mocked(fs.access);

describe('getCachedWorkspaceStatus', () => {
  beforeEach(() => {
    fsScanReposMock.mockReset();
    gitStatusMock.mockReset();
    fsAccessMock.mockReset();
    fsAccessMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns clean when no repos are detected', async () => {
    fsScanReposMock.mockResolvedValueOnce([]);

    const result = await getCachedWorkspaceStatus('/ws-empty');

    expect(result.status).toBe('clean');
    expect(fsScanReposMock).toHaveBeenCalledWith({
      path: '/ws-empty',
      maxDepth: 1
    });
  });

  it('returns danger when a repo has no .git folder', async () => {
    fsScanReposMock.mockResolvedValueOnce(['/ws-nogit/repo1']);
    fsAccessMock.mockRejectedValueOnce(new Error('ENOENT'));
    gitStatusMock.mockResolvedValueOnce({
      branch: { detached: false },
      files: [],
      clean: true
    });

    const result = await getCachedWorkspaceStatus('/ws-nogit');

    expect(result.status).toBe('danger');
  });

  it('returns warning when a repo has uncommitted changes', async () => {
    fsScanReposMock.mockResolvedValueOnce(['/ws-warning/repo1']);
    gitStatusMock.mockResolvedValueOnce({
      branch: { detached: false },
      files: [{ path: 'file.txt', index: 'M', workTree: ' ' }],
      clean: false
    });

    const result = await getCachedWorkspaceStatus('/ws-warning');

    expect(result.status).toBe('warning');
  });

  it('returns danger when any repo is broken even if another is dirty', async () => {
    fsScanReposMock.mockResolvedValueOnce(['/ws-mixed/bad', '/ws-mixed/ok']);
    fsAccessMock.mockImplementation(async (target) => {
      if (String(target).includes('/ws-mixed/bad')) {
        throw new Error('ENOENT');
      }
      return undefined;
    });
    gitStatusMock.mockResolvedValueOnce({
      branch: { detached: false },
      files: [{ path: 'file.txt', index: 'M', workTree: ' ' }],
      clean: false
    });

    const result = await getCachedWorkspaceStatus('/ws-mixed');

    expect(result.status).toBe('danger');
  });

  it('returns warning when gitStatus throws for a repo', async () => {
    fsScanReposMock.mockResolvedValueOnce(['/ws-throws/repo1']);
    gitStatusMock.mockRejectedValueOnce(new Error('git failed'));

    const result = await getCachedWorkspaceStatus('/ws-throws');

    expect(result.status).toBe('warning');
  });

  it('caches the result within the TTL window', async () => {
    fsScanReposMock.mockResolvedValue(['/ws-cache/repo1']);
    gitStatusMock.mockResolvedValue({
      branch: { detached: false },
      files: [],
      clean: true
    });

    const first = await getCachedWorkspaceStatus('/ws-cache');
    const second = await getCachedWorkspaceStatus('/ws-cache');

    expect(first).toEqual(second);
    expect(fsScanReposMock).toHaveBeenCalledTimes(1);
    expect(gitStatusMock).toHaveBeenCalledTimes(1);
  });
});
