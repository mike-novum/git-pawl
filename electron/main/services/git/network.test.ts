import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { buildAuthedUrl } from './clone';
import { gitFetch, gitPull, gitPush } from './network';

const initRepo = (cwd: string, bare = false): void => {
  const args = ['init', ...(bare ? ['--bare'] : [])];
  spawnSync('git', [...args, cwd], { stdio: 'ignore' });
  if (!bare) {
    spawnSync('git', ['config', 'user.email', 'test@example.com'], { cwd });
    spawnSync('git', ['config', 'user.name', 'Test'], { cwd });
  }
};

const seedCommit = (cwd: string, fileName: string, content: string): void => {
  writeFileSync(join(cwd, fileName), content);
  spawnSync('git', ['add', '.'], { cwd });
  spawnSync('git', ['commit', '-m', `add ${fileName}`], { cwd });
};

describe('network auth url injection', () => {
  it('buildAuthedUrl injects token into https url', () => {
    expect(buildAuthedUrl('https://github.com/foo/bar.git', 'abc')).toBe(
      'https://oauth2:abc@github.com/foo/bar.git'
    );
  });
});

describe('network operations', () => {
  let workDir: string;
  let bareDir: string;
  let repoDir: string;

  beforeEach(() => {
    workDir = mkdtempSync(join(tmpdir(), 'git-pawl-network-test-'));
    bareDir = join(workDir, 'origin.git');
    repoDir = join(workDir, 'repo');

    initRepo(bareDir, true);
    initRepo(repoDir);
    seedCommit(repoDir, 'README.md', 'init');
    spawnSync('git', ['remote', 'add', 'origin', bareDir], { cwd: repoDir });
    spawnSync('git', ['push', '-u', 'origin', 'master'], { cwd: repoDir });
  });

  afterEach(() => {
    rmSync(workDir, { recursive: true, force: true });
  });

  it('gitFetch fetches from default remote without throwing', async () => {
    await expect(gitFetch({ repoPath: repoDir })).resolves.toBeUndefined();
  });

  it('gitPush pushes a new commit to remote', async () => {
    seedCommit(repoDir, 'extra.txt', 'more');
    await expect(
      gitPush({ repoPath: repoDir, remote: 'origin', branch: 'master' })
    ).resolves.toBeUndefined();
  });

  it('gitPull pulls latest changes into repo', async () => {
    const cloneDir = join(workDir, 'clone');
    spawnSync('git', ['clone', bareDir, cloneDir], { stdio: 'ignore' });
    spawnSync('git', ['config', 'user.email', 't@t.com'], { cwd: cloneDir });
    spawnSync('git', ['config', 'user.name', 't'], { cwd: cloneDir });
    seedCommit(cloneDir, 'from-clone.md', 'hello');
    spawnSync('git', ['push', 'origin', 'master'], { cwd: cloneDir });

    await expect(gitPull({ repoPath: repoDir })).resolves.toBeUndefined();
    expect(spawnSync('git', ['log', '--oneline'], { cwd: repoDir }).stdout.toString()).toContain(
      'from-clone.md'
    );
  });

  it('rejects when repoPath does not exist', async () => {
    await expect(gitFetch({ repoPath: '/no-such-path-xyz9' })).rejects.toThrow(
      /does not exist/
    );
  });

  it('rejects when repoPath is a file, not a directory', async () => {
    const file = join(workDir, 'a-file.txt');
    writeFileSync(file, 'hi');
    await expect(gitFetch({ repoPath: file })).rejects.toThrow(/not a directory/);
  });

  it('rejects with aborted error when signal already aborted', async () => {
    const ac = new AbortController();
    ac.abort();
    await expect(
      gitFetch({ repoPath: repoDir }, { signal: ac.signal })
    ).rejects.toThrow(/abort/);
  });
});