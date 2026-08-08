import { describe, expect, it } from 'vitest';

import type { Commit } from '@electron/shared/types/git';

import type { Branch } from '@/entities/branch';
import { toCommitNodes } from '@/pages/repository';

type CreateCommitOptions = {
  parents?: string[];
};

const createCommit = (hash: string, options: CreateCommitOptions = {}): Commit => ({
  hash,
  parents: options.parents ?? [],
  author: { name: 'Author', email: 'author@example.com' },
  date: 0,
  subject: hash,
  body: ''
});

const createBranch = (
  name: string,
  target: string,
  commits: string[],
  current = false
): Branch => ({
  name,
  target,
  current,
  commits
});

describe('toCommitNodes', () => {
  it('marks every commit on a feature branch with that branch, not only the tip', () => {
    const entries: Commit[] = [
      createCommit('tip', { parents: ['middle'] }),
      createCommit('middle', { parents: ['root'] }),
      createCommit('root', { parents: [] })
    ];
    const branches: Branch[] = [
      createBranch('main', 'root', ['root'], true),
      createBranch('feature-x', 'tip', ['tip', 'middle', 'root'])
    ];

    const nodes = toCommitNodes(entries, branches, [], 'main');

    const byHash = new Map(nodes.map((node) => [node.hash, node]));

    expect(byHash.get('tip')?.branches).toEqual(['feature-x']);
    expect(byHash.get('middle')?.branches).toEqual(['feature-x']);
    expect(byHash.get('root')?.branches).toEqual(['main', 'feature-x']);
  });

  it('marks three feature-branch commits with the branch name', () => {
    const entries: Commit[] = [
      createCommit('f-tip', { parents: ['f-mid'] }),
      createCommit('f-mid', { parents: ['f-base'] }),
      createCommit('f-base', { parents: ['root'] }),
      createCommit('root', { parents: [] })
    ];
    const branches: Branch[] = [
      createBranch('main', 'root', ['root'], true),
      createBranch('feature-y', 'f-tip', ['f-tip', 'f-mid', 'f-base', 'root'])
    ];

    const nodes = toCommitNodes(entries, branches, [], 'main');

    const byHash = new Map(nodes.map((node) => [node.hash, node]));

    expect(byHash.get('f-tip')?.branches).toEqual(['feature-y']);
    expect(byHash.get('f-mid')?.branches).toEqual(['feature-y']);
    expect(byHash.get('f-base')?.branches).toEqual(['feature-y']);
    expect(byHash.get('root')?.branches).toEqual(['main', 'feature-y']);
  });

  it('keeps walking through the visible set until it leaves it', () => {
    const entries: Commit[] = [
      createCommit('tip', { parents: ['mid'] }),
      createCommit('mid', { parents: ['outside'] })
    ];
    const branches: Branch[] = [
      createBranch('main', 'outside', ['outside'], true),
      createBranch('orphan', 'tip', ['tip', 'mid'])
    ];

    const nodes = toCommitNodes(entries, branches, [], 'main');

    const byHash = new Map(nodes.map((node) => [node.hash, node]));

    expect(byHash.get('tip')?.branches).toEqual(['orphan']);
    expect(byHash.get('mid')?.branches).toEqual(['orphan']);
  });

  it('does not duplicate a branch name when tip already has it pre-tagged', () => {
    const entries: Commit[] = [
      createCommit('tip', { parents: ['mid'] }),
      createCommit('mid', { parents: [] })
    ];
    const branches: Branch[] = [
      createBranch('only', 'tip', ['tip', 'mid'], true)
    ];

    const nodes = toCommitNodes(entries, branches, [], 'only');

    const byHash = new Map(nodes.map((node) => [node.hash, node]));

    expect(byHash.get('tip')?.branches).toEqual(['only']);
    expect(byHash.get('mid')?.branches).toEqual(['only']);
  });

  it('preserves the original branch order when both branches share a commit', () => {
    const entries: Commit[] = [
      createCommit('shared', { parents: ['root'] }),
      createCommit('root', { parents: [] })
    ];
    const branches: Branch[] = [
      createBranch('main', 'shared', ['shared', 'root'], true),
      createBranch('feature-z', 'shared', ['shared', 'root'])
    ];

    const nodes = toCommitNodes(entries, branches, [], 'main');

    const byHash = new Map(nodes.map((node) => [node.hash, node]));

    expect(byHash.get('shared')?.branches).toEqual(['main', 'feature-z']);
    expect(byHash.get('root')?.branches).toEqual(['main', 'feature-z']);
  });

  it('does not break when a branch target is empty', () => {
    const entries: Commit[] = [createCommit('root', { parents: [] })];
    const branches: Branch[] = [
      createBranch('main', 'root', ['root'], true),
      createBranch('broken', '', [])
    ];

    const nodes = toCommitNodes(entries, branches, [], 'main');

    const byHash = new Map(nodes.map((node) => [node.hash, node]));

    expect(byHash.get('root')?.branches).toEqual(['main']);
  });

  it('does not tag a commit on a feature branch with main when main has only its own commits', () => {
    const entries: Commit[] = [
      createCommit('feature-tip', { parents: ['feature-mid'] }),
      createCommit('feature-mid', { parents: ['base'] }),
      createCommit('base', { parents: ['main-tip'] }),
      createCommit('main-tip', { parents: [] })
    ];
    const branches: Branch[] = [
      createBranch('main', 'main-tip', ['main-tip', 'base'], true),
      createBranch('feature-only', 'feature-tip', [
        'feature-tip',
        'feature-mid',
        'base'
      ])
    ];

    const nodes = toCommitNodes(entries, branches, [], 'main');

    const byHash = new Map(nodes.map((node) => [node.hash, node]));

    expect(byHash.get('feature-tip')?.branches).toEqual(['feature-only']);
    expect(byHash.get('feature-mid')?.branches).toEqual(['feature-only']);
    expect(byHash.get('base')?.branches).toEqual(['main', 'feature-only']);
    expect(byHash.get('main-tip')?.branches).toEqual(['main']);
  });

  it('ignores commits listed on the branch that are not in the visible set', () => {
    const entries: Commit[] = [createCommit('tip', { parents: [] })];
    const branches: Branch[] = [
      createBranch('main', 'tip', ['tip'], true),
      createBranch('feature', 'tip', ['tip', 'offscreen'])
    ];

    const nodes = toCommitNodes(entries, branches, [], 'main');

    const byHash = new Map(nodes.map((node) => [node.hash, node]));

    expect(byHash.get('tip')?.branches).toEqual(['main', 'feature']);
  });
});
