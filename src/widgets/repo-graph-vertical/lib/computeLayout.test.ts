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

const rowCenterY = (rowIndex: number): number =>
  rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2;

describe('computeLayout', () => {
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

  it('emits continuous vertical lines between consecutive same-lane commits', () => {
    const commits = [
      createCommit('first', ['second'], 3),
      createCommit('second', ['third'], 2),
      createCommit('third', [], 1)
    ];

    const layout = computeLayout(commits);

    expect(layout.continuousLines).toEqual([
      {
        fromLane: 0,
        toLane: 0,
        fromY: rowCenterY(0),
        toY: rowCenterY(1),
        color: 'var(--color-graph-lane-1)'
      },
      {
        fromLane: 0,
        toLane: 0,
        fromY: rowCenterY(1),
        toY: rowCenterY(2),
        color: 'var(--color-graph-lane-1)'
      }
    ]);
  });

  it('does not generate continuous lines past the last commit on a lane', () => {
    const commits = [
      createCommit('a', ['b'], 3),
      createCommit('b', ['c'], 2),
      createCommit('c', [], 1)
    ];

    const layout = computeLayout(commits);
    const lastRowY = rowCenterY(layout.rows.length - 1);

    const overflow = layout.continuousLines.filter(
      (line) => line.toY > lastRowY
    );
    expect(overflow).toEqual([]);
  });

  it('emits one parent edge per parent relationship', () => {
    const commits = [
      createCommit('merge', ['main', 'feature'], 4),
      createCommit('main', ['root'], 3),
      createCommit('feature', ['root'], 2),
      createCommit('root', [], 1)
    ];

    const layout = computeLayout(commits);

    expect(layout.parentEdges).toEqual([
      {
        fromLane: 0,
        toLane: 0,
        fromY: rowCenterY(0),
        toY: rowCenterY(1),
        color: 'var(--color-graph-lane-1)'
      },
      {
        fromLane: 0,
        toLane: 1,
        fromY: rowCenterY(0),
        toY: rowCenterY(2),
        color: expect.any(String) as unknown as string
      },
      {
        fromLane: 0,
        toLane: 0,
        fromY: rowCenterY(1),
        toY: rowCenterY(3),
        color: 'var(--color-graph-lane-1)'
      },
      {
        fromLane: 1,
        toLane: 0,
        fromY: rowCenterY(2),
        toY: rowCenterY(3),
        color: 'var(--color-graph-lane-1)'
      }
    ]);
  });

  it('uses absolute y-coordinates derived from row index and ROW_HEIGHT', () => {
    const commits = [
      createCommit('first', ['second'], 2),
      createCommit('second', [], 1)
    ];

    const layout = computeLayout(commits);

    expect(layout.parentEdges[0]).toEqual({
      fromLane: 0,
      toLane: 0,
      fromY: rowCenterY(0),
      toY: rowCenterY(1),
      color: 'var(--color-graph-lane-1)'
    });
    expect(layout.continuousLines).toEqual([
      {
        fromLane: 0,
        toLane: 0,
        fromY: rowCenterY(0),
        toY: rowCenterY(1),
        color: 'var(--color-graph-lane-1)'
      }
    ]);
  });

  it('does not generate edges for parents outside the visible set', () => {
    const commits = [
      createCommit('first', ['second', 'outside'], 2),
      createCommit('second', [], 1)
    ];

    const layout = computeLayout(commits);

    expect(layout.rows[0]?.parents).toEqual([
      {
        hash: 'second',
        lane: 0,
        rowIndex: 1,
        active: false,
        color: 'var(--color-graph-lane-1)'
      }
    ]);
    expect(layout.parentEdges).toHaveLength(1);
  });

  it('keeps commit in its lane when first parent is on the same lane', () => {
    const commits = [
      createCommit('top', ['middle'], 3),
      createCommit('middle', ['bottom'], 2),
      createCommit('bottom', [], 1)
    ];

    const layout = computeLayout(commits);

    expect(layout.rows.every(({ lane }) => lane === 0)).toBe(true);
    expect(layout.continuousLines).toHaveLength(2);
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

  it('produces total height equal to rows.length * ROW_HEIGHT', () => {
    const commits = [
      createCommit('a', ['b'], 3),
      createCommit('b', ['c'], 2),
      createCommit('c', [], 1)
    ];

    const layout = computeLayout(commits);

    expect(layout.height).toBe(layout.rows.length * ROW_HEIGHT);
  });

  it('sets width to GRAPH_WIDTH + maxLane * LANE_WIDTH', () => {
    const commits = [
      createCommit('merge', ['main', 'feature'], 4),
      createCommit('main', ['root'], 3),
      createCommit('feature', ['root'], 2),
      createCommit('root', [], 1)
    ];

    const layout = computeLayout(commits);

    expect(layout.maxLane).toBe(1);
    expect(layout.width).toBe(32 + 1 * 14);
  });

  it('uses ROW_HEIGHT=32 for compact single-row rendering', () => {
    expect(ROW_HEIGHT).toBe(32);
  });
});
