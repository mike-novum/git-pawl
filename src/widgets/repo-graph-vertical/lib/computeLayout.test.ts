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

  it('draws an outgoing segment in the source row and an incoming segment in the destination row for continuous vertical lines', () => {
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
      color: 'var(--color-graph-lane-1)',
      direction: 'outgoing'
    });
    expect(layout.rows[1]?.verticalLines).toContainEqual({
      fromLane: 0,
      toLane: 0,
      rowDistance: 1,
      color: 'var(--color-graph-lane-1)',
      direction: 'incoming'
    });
    expect(layout.rows[1]?.verticalLines).toContainEqual({
      fromLane: 0,
      toLane: 0,
      rowDistance: 1,
      color: 'var(--color-graph-lane-1)',
      direction: 'outgoing'
    });
    expect(layout.rows[2]?.verticalLines).toContainEqual({
      fromLane: 0,
      toLane: 0,
      rowDistance: 1,
      color: 'var(--color-graph-lane-1)',
      direction: 'incoming'
    });
  });

  it('does not add an outgoing continuous line past the last commit on a lane', () => {
    const commits = [
      createCommit('a', ['b'], 3),
      createCommit('b', ['c'], 2),
      createCommit('c', [], 1)
    ];

    const layout = computeLayout(commits);

    const lastRowContinuousOutgoing = (layout.rows[2]?.verticalLines ?? []).filter(
      (line) =>
        line.direction === 'outgoing' &&
        line.fromLane === line.toLane
    );
    expect(lastRowContinuousOutgoing).toEqual([]);
  });

  it('produces both outgoing and incoming segments for every parent edge', () => {
    const commits = [
      createCommit('merge', ['main', 'feature'], 4),
      createCommit('main', ['root'], 3),
      createCommit('feature', ['root'], 2),
      createCommit('root', [], 1)
    ];

    const layout = computeLayout(commits);

    const mergeRowOutgoing = (layout.rows[0]?.verticalLines ?? []).filter(
      (line) => line.direction === 'outgoing'
    );
    expect(mergeRowOutgoing.length).toBeGreaterThanOrEqual(2);

    const mainRowIncoming = (layout.rows[1]?.verticalLines ?? []).filter(
      (line) => line.direction === 'incoming'
    );
    expect(mainRowIncoming.some((line) => line.toLane === 0 && line.fromLane === 0)).toBe(true);

    const featureRowIncoming = (layout.rows[2]?.verticalLines ?? []).filter(
      (line) => line.direction === 'incoming'
    );
    expect(featureRowIncoming.some((line) => line.fromLane === 0 && line.toLane === 1)).toBe(true);
  });

  it('first row receives no incoming lines at all', () => {
    const commits = [
      createCommit('first', ['second'], 2),
      createCommit('second', [], 1)
    ];

    const layout = computeLayout(commits);

    const firstRowIncoming = (layout.rows[0]?.verticalLines ?? []).filter(
      (line) => line.direction === 'incoming'
    );
    expect(firstRowIncoming).toEqual([]);
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
