import { describe, expect, it } from 'vitest';

import type { CommitNode } from '../types';

import { computeLayout } from './computeLayout';

const createCommit = (
  hash: string,
  parents: string[],
  timestamp: number
): CommitNode => ({
  hash,
  shortHash: hash,
  subject: hash,
  author: 'Author',
  timestamp,
  parents,
  lane: 0
});

describe('computeLayout', () => {
  it('assigns separate lanes to merge parents and joins them at their shared parent', () => {
    const commits = [
      createCommit('merge', ['main', 'feature'], 4),
      createCommit('main', ['root'], 3),
      createCommit('feature', ['root'], 2),
      createCommit('root', [], 1)
    ];

    const layout = computeLayout(commits);

    expect(layout.rows.map(({ commit, lane }) => [commit.hash, lane])).toEqual([
      ['merge', 0],
      ['main', 0],
      ['feature', 1],
      ['root', 0]
    ]);
    expect(layout.rows[0]?.parents).toEqual([
      { hash: 'main', lane: 0, rowIndex: 1, active: false },
      { hash: 'feature', lane: 1, rowIndex: 2, active: false }
    ]);
    expect(layout.rows[2]?.parents).toEqual([
      { hash: 'root', lane: 0, rowIndex: 3, active: false }
    ]);
  });

  it('preserves the topological order returned by git log', () => {
    const commits = [
      createCommit('b-child', ['a-parent'], 1),
      createCommit('a-parent', [], 1)
    ];

    const layout = computeLayout(commits);

    expect(layout.rows.map(({ commit }) => commit.hash)).toEqual([
      'b-child',
      'a-parent'
    ]);
    expect(layout.rows[0]?.parents[0]?.rowIndex).toBe(1);
  });

  it('marks the current branch first-parent lane as active', () => {
    const commits = [
      {
        ...createCommit('merge', ['main', 'feature'], 4),
        isCurrentBranch: true
      },
      createCommit('main', ['root'], 3),
      createCommit('feature', ['root'], 2),
      createCommit('root', [], 1)
    ];

    const layout = computeLayout(commits);

    expect(
      layout.rows.map(({ commit, active }) => [commit.hash, active])
    ).toEqual([
      ['merge', true],
      ['main', true],
      ['feature', false],
      ['root', true]
    ]);
    expect(
      layout.rows[0]?.parents.map(({ hash, active }) => [hash, active])
    ).toEqual([
      ['main', true],
      ['feature', false]
    ]);
  });
});
