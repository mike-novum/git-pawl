import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('electron', () => ({
  BrowserWindow: {
    getFocusedWindow: () => undefined,
    getAllWindows: () => []
  },
  dialog: {
    showOpenDialog: vi.fn()
  }
}));

vi.mock('sharp', () => ({
  default: vi.fn(() => ({
    resize: vi.fn().mockReturnThis(),
    toFile: vi.fn().mockResolvedValue(undefined)
  }))
}));

vi.mock('./store', () => ({
  storeGet: vi.fn(),
  storeSet: vi.fn()
}));

import { getRepoSize, workspaceCreate, workspaceList } from './fs';

const WORKSPACE_KEY = 'workspaces';

let tmpRoot: string;

beforeEach(async () => {
  tmpRoot = await mkdtemp(path.join(tmpdir(), 'git-pawl-fs-'));
});

afterEach(async () => {
  await rm(tmpRoot, { recursive: true, force: true });
  vi.clearAllMocks();
});

const write = async (rel: string, content: string): Promise<void> => {
  const full = path.join(tmpRoot, rel);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, content);
};

describe('getRepoSize', () => {
  it('returns zeros for empty directory', async () => {
    const result = await getRepoSize({ repoPath: tmpRoot });
    expect(result).toEqual({ totalBytes: 0, fileCount: 0, gitBytes: 0 });
  });

  it('counts files and total bytes excluding .git/objects', async () => {
    await write('README.md', 'hello');
    await write('src/index.ts', 'export {}');
    await write('src/lib/util.ts', 'export const x = 1;');

    const result = await getRepoSize({ repoPath: tmpRoot });

    expect(result.fileCount).toBe(3);
    expect(result.totalBytes).toBe('hello'.length + 'export {}'.length + 'export const x = 1;'.length);
    expect(result.gitBytes).toBe(0);
  });

  it('counts .git/objects separately and excludes them from totals', async () => {
    await write('README.md', 'hello');
    await write('.git/objects/aa/bb', 'pack');
    await write('.git/HEAD', 'ref: refs/heads/main');

    const result = await getRepoSize({ repoPath: tmpRoot });

    expect(result.fileCount).toBe(2);
    expect(result.totalBytes).toBe('hello'.length + 'ref: refs/heads/main'.length);
    expect(result.gitBytes).toBe('pack'.length);
  });

  it('handles nested directories', async () => {
    await write('a/b/c/d.txt', 'x');
    await write('a/b/e.txt', 'yy');
    await write('a/f.txt', 'zzz');

    const result = await getRepoSize({ repoPath: tmpRoot });

    expect(result.fileCount).toBe(3);
    expect(result.totalBytes).toBe('x'.length + 'yy'.length + 'zzz'.length);
  });

  it('ignores symbolic links', async () => {
    await write('real.txt', 'real');
    const target = path.join(tmpRoot, 'real.txt');
    await symlink(target, path.join(tmpRoot, 'link.txt'), 'file');

    const result = await getRepoSize({ repoPath: tmpRoot });

    expect(result.fileCount).toBe(1);
    expect(result.totalBytes).toBe('real'.length);
  });

  it('throws for non-existent path', async () => {
    await expect(
      getRepoSize({ repoPath: path.join(tmpRoot, 'missing') })
    ).rejects.toThrow(/ENOENT|No such file/);
  });

  it('throws when path is a file', async () => {
    const file = path.join(tmpRoot, 'file.txt');
    await writeFile(file, 'x');

    await expect(getRepoSize({ repoPath: file })).rejects.toThrow(/Not a directory/);
  });

  it('counts .git/objects at any depth as gitBytes', async () => {
    await write('.git/objects/aa/bb/cc/dd', 'deep');
    await write('.git/objects/xx', 'top');
    await write('main.txt', 'ok');

    const result = await getRepoSize({ repoPath: tmpRoot });

    expect(result.fileCount).toBe(1);
    expect(result.totalBytes).toBe('ok'.length);
    expect(result.gitBytes).toBe('deep'.length + 'top'.length);
  });
});

describe('workspaces', () => {
  it('creates a workspace and lists it', async () => {
    const { storeGet, storeSet } = await import('./store');
    vi.mocked(storeGet).mockReturnValue([]);
    vi.mocked(storeSet).mockImplementation(() => undefined);

    const target = path.join(tmpRoot, 'ws');
    await mkdir(target);

    const created = await workspaceCreate({ path: target, name: 'My WS' });

    expect(created.name).toBe('My WS');
    expect(created.path).toBe(target);
    expect(created.id).toBeTypeOf('string');
    expect(created.createdAt).toBeTypeOf('number');

    vi.mocked(storeGet).mockReturnValue([created]);

    const list = await workspaceList();
    expect(list).toEqual([created]);

    expect(storeSet).toHaveBeenCalledWith(WORKSPACE_KEY, [created]);
  });

  it('returns existing workspace when path is duplicated', async () => {
    const { storeGet } = await import('./store');
    const target = path.join(tmpRoot, 'ws');
    await mkdir(target);

    const existing = {
      id: 'fixed-id',
      name: 'Existing',
      path: target,
      createdAt: 1
    };
    vi.mocked(storeGet).mockReturnValue([existing]);

    const result = await workspaceCreate({ path: target });
    expect(result).toEqual(existing);
  });

  it('defaults name to basename when not provided', async () => {
    const { storeGet, storeSet } = await import('./store');
    vi.mocked(storeGet).mockReturnValue([]);
    vi.mocked(storeSet).mockImplementation(() => undefined);

    const target = path.join(tmpRoot, 'my-project');
    await mkdir(target);

    const created = await workspaceCreate({ path: target });
    expect(created.name).toBe('my-project');
  });
});
