import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { buildRepoId, detectRepos, scanRepos } from './fs-scanner';

let tmpRoot: string;

beforeEach(async () => {
  tmpRoot = await mkdtemp(path.join(tmpdir(), 'git-pawl-scanner-'));
});

afterEach(async () => {
  await rm(tmpRoot, { recursive: true, force: true });
});

const write = async (rel: string, content: string): Promise<void> => {
  const full = path.join(tmpRoot, rel);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, content);
};

describe('detectRepos', () => {
  it('returns an empty list for empty directory', async () => {
    const result = await detectRepos({ path: tmpRoot });
    expect(result).toEqual([]);
  });

  it('finds repositories at the root level', async () => {
    await write('repo1/.git/HEAD', 'ref: refs/heads/main');
    await write('repo1/README.md', 'r1');
    await write('repo2/.git/HEAD', 'ref: refs/heads/main');

    const result = await detectRepos({ path: tmpRoot });
    expect(result).toHaveLength(2);
  });

  it('skips hidden directories except .git', async () => {
    await write('visible/.git/HEAD', 'ref: refs/heads/main');
    await write('.cache/.git/HEAD', 'ref: refs/heads/main');
    await write('.hidden/.git/HEAD', 'ref: refs/heads/main');

    const result = await detectRepos({ path: tmpRoot });
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(path.join(tmpRoot, 'visible'));
  });

  it('returns empty list for non-existent path', async () => {
    const result = await detectRepos({ path: path.join(tmpRoot, 'missing') });
    expect(result).toEqual([]);
  });

  it('returns empty list for a file path', async () => {
    const file = path.join(tmpRoot, 'file.txt');
    await writeFile(file, 'x');
    const result = await detectRepos({ path: file });
    expect(result).toEqual([]);
  });

  it('respects maxDepth', async () => {
    await write('a/b/c/repo/.git/HEAD', 'ref: refs/heads/main');

    const shallow = await detectRepos({ path: tmpRoot, maxDepth: 2 });
    expect(shallow).toEqual([]);

    const deep = await detectRepos({ path: tmpRoot, maxDepth: 5 });
    expect(deep).toEqual([path.join(tmpRoot, 'a/b/c/repo')]);
  });

  it('does not follow symbolic links', async () => {
    await write('real/.git/HEAD', 'ref: refs/heads/main');
    const linkTarget = path.join(tmpRoot, 'real');
    const linkPath = path.join(tmpRoot, 'link');
    await symlink(linkTarget, linkPath, 'dir');

    const result = await detectRepos({ path: tmpRoot });
    expect(result).toEqual([linkTarget]);
  });
});

describe('scanRepos', () => {
  it('finds repositories at any depth', async () => {
    await write('a/b/c/.git/HEAD', 'ref: refs/heads/main');
    await write('a/d/.git/HEAD', 'ref: refs/heads/main');

    const result = await scanRepos({ path: tmpRoot });
    expect(result).toHaveLength(2);
    expect(result).toContain(path.join(tmpRoot, 'a/b/c'));
    expect(result).toContain(path.join(tmpRoot, 'a/d'));
  });

  it('finds nested worktrees (repo inside another repo)', async () => {
    await write('outer/.git/HEAD', 'ref: refs/heads/main');
    await write('outer/sub/.git/HEAD', 'ref: refs/heads/main');

    const result = await scanRepos({ path: tmpRoot });
    expect(result).toContain(path.join(tmpRoot, 'outer'));
  });

  it('returns empty list for empty directory', async () => {
    const result = await scanRepos({ path: tmpRoot });
    expect(result).toEqual([]);
  });

  it('respects maxDepth', async () => {
    await write('a/b/c/.git/HEAD', 'ref: refs/heads/main');

    const shallow = await scanRepos({ path: tmpRoot, maxDepth: 2 });
    expect(shallow).toEqual([]);

    const deep = await scanRepos({ path: tmpRoot, maxDepth: 4 });
    expect(deep).toEqual([path.join(tmpRoot, 'a/b/c')]);
  });
});

describe('buildRepoId', () => {
  it('returns a 16 character hex prefix', async () => {
    const id = await buildRepoId({ path: tmpRoot });
    expect(id).toMatch(/^[0-9a-f]{16}$/);
  });

  it('is deterministic for the same path', async () => {
    const id1 = await buildRepoId({ path: tmpRoot });
    const id2 = await buildRepoId({ path: tmpRoot });
    expect(id1).toBe(id2);
  });

  it('produces different ids for different paths', async () => {
    const id1 = await buildRepoId({ path: tmpRoot });
    const id2 = await buildRepoId({ path: path.join(tmpRoot, 'sub') });
    expect(id1).not.toBe(id2);
  });

  it('normalizes trailing slashes', async () => {
    const id1 = await buildRepoId({ path: tmpRoot });
    const id2 = await buildRepoId({ path: `${tmpRoot}/` });
    expect(id1).toBe(id2);
  });
});