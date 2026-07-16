import { mkdtempSync, rmSync, existsSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { buildAuthedUrl, parseCloneProgress, gitClone } from './clone';

describe('buildAuthedUrl', () => {
  it('returns url unchanged when no token provided', () => {
    expect(buildAuthedUrl('https://github.com/foo/bar.git')).toBe(
      'https://github.com/foo/bar.git'
    );
  });

  it('injects oauth2 token into https url', () => {
    expect(buildAuthedUrl('https://github.com/foo/bar.git', 'secret123')).toBe(
      'https://oauth2:secret123@github.com/foo/bar.git'
    );
  });

  it('returns ssh url unchanged', () => {
    expect(buildAuthedUrl('git@github.com:foo/bar.git', 'token')).toBe(
      'git@github.com:foo/bar.git'
    );
  });
});

describe('parseCloneProgress', () => {
  it('returns null for empty lines', () => {
    expect(parseCloneProgress('')).toBeNull();
    expect(parseCloneProgress('   ')).toBeNull();
  });

  it('returns null for unrelated lines', () => {
    expect(parseCloneProgress('some random text')).toBeNull();
  });

  it('returns line for Cloning into', () => {
    expect(parseCloneProgress("Cloning into 'foo'...")).toBe(
      "Cloning into 'foo'..."
    );
  });

  it('returns line for remote messages', () => {
    expect(parseCloneProgress('remote: Counting objects: 100')).toBe(
      'remote: Counting objects: 100'
    );
  });

  it('returns line for receiving objects progress', () => {
    expect(parseCloneProgress('Receiving objects:  45% (100/222)')).toBe(
      'Receiving objects:  45% (100/222)'
    );
  });

  it('returns line for resolving deltas', () => {
    expect(parseCloneProgress('Resolving deltas: 100% (50/50)')).toBe(
      'Resolving deltas: 100% (50/50)'
    );
  });
});

describe('gitClone', () => {
  let workDir: string;
  let bareDir: string;
  let cloneDest: string;

  beforeEach(() => {
    workDir = mkdtempSync(join(tmpdir(), 'git-pawl-clone-test-'));
    bareDir = join(workDir, 'origin.git');
    cloneDest = join(workDir, 'clone');

    spawnSync('git', ['init', '--bare', bareDir], { stdio: 'ignore' });

    const seedDir = join(workDir, 'seed');
    spawnSync('git', ['init', seedDir], { stdio: 'ignore' });
    spawnSync('git', ['config', 'user.email', 'test@example.com'], {
      cwd: seedDir
    });
    spawnSync('git', ['config', 'user.name', 'Test'], { cwd: seedDir });
    writeFileSync(join(seedDir, 'README.md'), '# hello\n');
    spawnSync('git', ['add', '.'], { cwd: seedDir });
    spawnSync('git', ['commit', '-m', 'init'], { cwd: seedDir });
    spawnSync('git', ['remote', 'add', 'origin', bareDir], { cwd: seedDir });
    spawnSync('git', ['push', 'origin', 'master'], { cwd: seedDir });
  });

  afterEach(() => {
    rmSync(workDir, { recursive: true, force: true });
  });

  it('clones a local bare repo into destination', async () => {
    const progress: string[] = [];
    await gitClone(
      { url: bareDir, destPath: cloneDest },
      (msg) => progress.push(msg)
    );
    expect(existsSync(join(cloneDest, '.git'))).toBe(true);
  });

  it('rejects when destination parent cannot be created', async () => {
    await expect(
      gitClone({ url: bareDir, destPath: '/nonexistent-root-x9z/dest' })
    ).rejects.toThrow();
  });

  it('cleans partial dest on failure', async () => {
    await expect(
      gitClone({ url: 'file:///definitely-not-a-repo-x9z', destPath: cloneDest })
    ).rejects.toThrow();
    expect(existsSync(cloneDest)).toBe(false);
  });

  it('rejects with aborted error when signal already aborted', async () => {
    const ac = new AbortController();
    ac.abort();
    await expect(
      gitClone({ url: bareDir, destPath: cloneDest }, undefined, {
        signal: ac.signal
      })
    ).rejects.toThrow(/abort/);
  });
});