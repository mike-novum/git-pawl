import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./exec', () => ({
  execGit: vi.fn()
}));

import { execGit } from './exec';
import { gitLog, gitShow } from './index';

const mockExecGit = vi.mocked(execGit);

let tmpRoot: string;

beforeEach(async () => {
  tmpRoot = await mkdtemp(join(tmpdir(), 'git-pawl-log-test-'));
  const gitDir = join(tmpRoot, '.git');
  await mkdir(gitDir, { recursive: true });
  await writeFile(join(gitDir, 'HEAD'), 'ref: refs/heads/main');
  mockExecGit.mockReset();
});

afterEach(async () => {
  await rm(tmpRoot, { recursive: true, force: true });
  vi.clearAllMocks();
});

describe('gitLog', () => {
  it('passes --topo-order to git so merge commits appear after merged-in commits', async () => {
    mockExecGit.mockResolvedValue({
      stdout: '',
      stderr: '',
      exitCode: 0
    });

    await gitLog({ repoPath: tmpRoot });

    expect(mockExecGit).toHaveBeenCalledTimes(1);
    const args = mockExecGit.mock.calls[0]?.[0] ?? [];
    expect(args).toContain('log');
    expect(args).toContain('--topo-order');
  });

  it('preserves --topo-order position before --format flag', async () => {
    mockExecGit.mockResolvedValue({
      stdout: '',
      stderr: '',
      exitCode: 0
    });

    await gitLog({ repoPath: tmpRoot });

    const args = mockExecGit.mock.calls[0]?.[0] ?? [];
    const logIdx = args.indexOf('log');
    const topoIdx = args.indexOf('--topo-order');
    expect(logIdx).toBe(0);
    expect(topoIdx).toBeGreaterThan(logIdx);
  });

  it('appends -n flag with maxCount when provided', async () => {
    mockExecGit.mockResolvedValue({
      stdout: '',
      stderr: '',
      exitCode: 0
    });

    await gitLog({ repoPath: tmpRoot, maxCount: 25 });

    const args = mockExecGit.mock.calls[0]?.[0] ?? [];
    expect(args).toContain('--topo-order');
    expect(args).toContain('-n');
    expect(args).toContain('25');
  });
});

describe('gitShow', () => {
  it('invokes git show with --name-status and the provided commit', async () => {
    mockExecGit.mockResolvedValue({
      stdout: '',
      stderr: '',
      exitCode: 0
    });

    await gitShow({ repoPath: tmpRoot, commit: 'abc123' });

    expect(mockExecGit).toHaveBeenCalledTimes(1);
    const args = mockExecGit.mock.calls[0]?.[0] ?? [];
    expect(args[0]).toBe('show');
    expect(args).toContain('--name-status');
    expect(args).toContain('--pretty=format:');
    expect(args).toContain('abc123');
  });

  it('returns parsed file status list on success', async () => {
    mockExecGit.mockResolvedValue({
      stdout: 'M\tsrc/a.ts\nA\tsrc/b.ts\n',
      stderr: '',
      exitCode: 0
    });

    const result = await gitShow({ repoPath: tmpRoot, commit: 'abc123' });

    expect(result).toEqual([
      { path: 'src/a.ts', index: 'M', workTree: 'M' },
      { path: 'src/b.ts', index: 'A', workTree: 'A' }
    ]);
  });

  it('wraps non-zero exit into a GitError', async () => {
    mockExecGit.mockResolvedValue({
      stdout: '',
      stderr: 'fatal: bad commit\n',
      exitCode: 128
    });

    await expect(
      gitShow({ repoPath: tmpRoot, commit: 'bad' })
    ).rejects.toThrow(/bad commit/);
  });
});
