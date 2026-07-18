import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/api', () => ({
  fsScanRepos: vi.fn(),
  gitRevParse: vi.fn(),
  gitStatus: vi.fn()
}));

import { fsScanRepos, gitRevParse, gitStatus } from '@/shared/api';

import { getCachedWorkspaceStatus } from './computeWorkspaceStatus';

const fsScanReposMock = vi.mocked(fsScanRepos);
const gitRevParseMock = vi.mocked(gitRevParse);
const gitStatusMock = vi.mocked(gitStatus);

describe('getCachedWorkspaceStatus', () => {
  beforeEach(() => {
    fsScanReposMock.mockReset();
    gitRevParseMock.mockReset();
    gitStatusMock.mockReset();
    gitRevParseMock.mockResolvedValue(undefined);
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
    gitRevParseMock.mockRejectedValueOnce(new Error('ENOENT'));
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
    gitRevParseMock.mockImplementation(async ({ repoPath }) => {
      if (repoPath === '/ws-mixed/bad') {
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