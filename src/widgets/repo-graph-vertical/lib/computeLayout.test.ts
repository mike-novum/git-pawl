import { describe, expect, it } from 'vitest';

import type { CommitNode } from '../types';

import { ROW_HEIGHT, computeLayout } from './computeLayout';

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
      {
        hash: 'main',
        lane: 0,
        rowIndex: 1,
        active: false,
        color: 'var(--color-graph-lane-1)'
      },
      {
        hash: 'feature',
        lane: 1,
        rowIndex: 2,
        active: false,
        color: expect.any(String) as unknown as string
      }
    ]);
    expect(layout.rows[2]?.parents).toEqual([
      {
        hash: 'root',
        lane: 0,
        rowIndex: 3,
        active: false,
        color: 'var(--color-graph-lane-1)'
      }
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

  it('uses ROW_HEIGHT=32 for compact single-row rendering', () => {
    expect(ROW_HEIGHT).toBe(32);
  });

  it('assigns a deterministic css-variable color to each lane', () => {
    const commits = [
      createCommit('a', ['b', 'c'], 3),
      createCommit('b', [], 2),
      createCommit('c', [], 1)
    ];

    const layout = computeLayout(commits);

    expect(layout.lanes.map(({ index, color }) => [index, color])).toEqual([
      [0, 'var(--color-graph-lane-1)'],
      [1, expect.stringMatching(/^var\(--color-graph-lane-\d+\)$/) as unknown as string]
    ]);
  });

  it('draws a continuous vertical line between two siblings on the same lane', () => {
    const commits = [
      createCommit('first', ['second'], 3),
      createCommit('second', ['third'], 2),
      createCommit('third', [], 1)
    ];

    const layout = computeLayout(commits);

    expect(layout.rows[0]?.verticalLines).toContainEqual({
      fromLane: 0,
      toLane: 0,
      rowDistance: 1,
      color: 'var(--color-graph-lane-1)'
    });
    expect(layout.rows[1]?.verticalLines).toContainEqual({
      fromLane: 0,
      toLane: 0,
      rowDistance: 1,
      color: 'var(--color-graph-lane-1)'
    });
    expect(layout.rows[2]?.verticalLines).toEqual([]);
  });

  it('colors each merge parent edge with its own lane color', () => {
    const commits = [
      createCommit('merge', ['main', 'feature'], 4),
      createCommit('main', ['root'], 3),
      createCommit('feature', ['root'], 2),
      createCommit('root', [], 1)
    ];

    const layout = computeLayout(commits);

    const parents = layout.rows[0]?.parents ?? [];
    const firstParentColor = parents[0]?.color;
    const secondParentColor = parents[1]?.color;

    expect(firstParentColor).toBe('var(--color-graph-lane-1)');
    expect(secondParentColor).not.toBe(firstParentColor);
    expect(secondParentColor).toBe(layout.lanes[1]?.color);
  });
});
