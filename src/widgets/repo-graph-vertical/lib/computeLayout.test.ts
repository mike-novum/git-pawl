import { describe, expect, it } from 'vitest';

import type { CommitNode } from '../types';

import { ROW_HEIGHT, computeLayout } from './computeLayout';

type CreateCommitOptions = {
  branches?: string[];
  isCurrentBranch?: boolean;
  currentBranchName?: string;
};

const createCommit = (
  hash: string,
  parents: string[],
  timestamp: number,
  options: CreateCommitOptions = {}
): CommitNode => ({
  hash,
  shortHash: hash,
  subject: hash,
  author: 'Author',
  timestamp,
  parents,
  lane: 0,
  branches: options.branches,
  isCurrentBranch: options.isCurrentBranch,
  currentBranchName: options.currentBranchName
});

const rowCenterY = (rowIndex: number): number =>
  rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2;

const laneColorVar = (index: number): string =>
  `var(--color-graph-lane-${index + 1})`;

describe('computeLayout', () => {
  it('preserves the topological order returned by git log', () => {
    const commits = [
      createCommit('b-child', ['a-parent'], 1, { branches: ['main'] }),
      createCommit('a-parent', [], 1, { branches: ['main'] })
    ];

    const layout = computeLayout(commits);

    expect(layout.rows.map(({ commit }) => commit.hash)).toEqual([
      'b-child',
      'a-parent'
    ]);
    expect(layout.rows[0]?.parents[0]?.rowIndex).toBe(1);
  });

  it('keeps a linear history on the head branch on lane 0', () => {
    const commits = [
      createCommit('c', ['b'], 3, { branches: ['main'] }),
      createCommit('b', ['a'], 2, { branches: ['main'] }),
      createCommit('a', [], 1, { branches: ['main'] })
    ];

    const layout = computeLayout(commits);

    expect(layout.rows.map(({ lane }) => lane)).toEqual([0, 0, 0]);
    expect(layout.maxLane).toBe(0);
    expect(layout.lanes.map(({ index, branchName }) => [index, branchName])).toEqual([
      [0, 'main']
    ]);
  });

  it('assigns side-branch commits to lane 1 and main commits to lane 0', () => {
    const commits = [
      createCommit('merge', ['main-tip', 'feature-tip'], 7, {
        branches: ['main'],
        isCurrentBranch: true,
        currentBranchName: 'main'
      }),
      createCommit('main-tip', ['main-mid'], 6, { branches: ['main'] }),
      createCommit('feature-tip', ['feature-mid'], 5, {
        branches: ['feature-x']
      }),
      createCommit('main-mid', ['root'], 4, { branches: ['main'] }),
      createCommit('feature-mid', ['root'], 3, { branches: ['feature-x'] }),
      createCommit('root', [], 2, { branches: ['main'] })
    ];

    const layout = computeLayout(commits);

    expect(layout.rows.map(({ commit, lane }) => [commit.hash, lane])).toEqual([
      ['merge', 0],
      ['main-tip', 0],
      ['feature-tip', 1],
      ['main-mid', 0],
      ['feature-mid', 1],
      ['root', 0]
    ]);
    expect(layout.lanes.map(({ index, branchName }) => [index, branchName])).toEqual([
      [0, 'main'],
      [1, 'feature-x']
    ]);
  });

  it('distributes commits across three branches into three lanes', () => {
    const commits = [
      createCommit('top', ['m1', 'f1', 'd1'], 7, {
        branches: ['main'],
        isCurrentBranch: true,
        currentBranchName: 'main'
      }),
      createCommit('m1', ['m2'], 6, { branches: ['main'] }),
      createCommit('f1', ['f2'], 5, { branches: ['feat-a'] }),
      createCommit('d1', ['d2'], 4, { branches: ['docs'] }),
      createCommit('m2', [], 3, { branches: ['main'] }),
      createCommit('f2', [], 2, { branches: ['feat-a'] }),
      createCommit('d2', [], 1, { branches: ['docs'] })
    ];

    const layout = computeLayout(commits);

    expect(layout.rows.map(({ commit, lane }) => [commit.hash, lane])).toEqual([
      ['top', 0],
      ['m1', 0],
      ['f1', 1],
      ['d1', 2],
      ['m2', 0],
      ['f2', 1],
      ['d2', 2]
    ]);
    expect(layout.lanes.map(({ index, branchName }) => [index, branchName])).toEqual([
      [0, 'main'],
      [1, 'feat-a'],
      [2, 'docs']
    ]);
  });

  it('emits parent edges with the destination lane color for cross-lane parents', () => {
    const commits = [
      createCommit('merge', ['main-tip', 'feature-tip'], 5, {
        branches: ['main'],
        isCurrentBranch: true,
        currentBranchName: 'main'
      }),
      createCommit('main-tip', ['root'], 4, { branches: ['main'] }),
      createCommit('feature-tip', ['root'], 3, { branches: ['feature'] }),
      createCommit('root', [], 2, { branches: ['main'] })
    ];

    const layout = computeLayout(commits);

    const mergeRow = layout.rows[0];
    const featureEdge = mergeRow?.parents.find(
      ({ hash }) => hash === 'feature-tip'
    );
    const mainEdge = mergeRow?.parents.find(({ hash }) => hash === 'main-tip');

    expect(featureEdge?.lane).toBe(1);
    expect(featureEdge?.color).toBe(laneColorVar(1));
    expect(mainEdge?.lane).toBe(0);
    expect(mainEdge?.color).toBe(laneColorVar(0));

    const mergeToFeature = layout.parentEdges.find(
      ({ fromY, toY, toLane }) =>
        fromY === rowCenterY(0) && toLane === 1 && toY === rowCenterY(2)
    );
    expect(mergeToFeature?.color).toBe(laneColorVar(1));

    const featureToRoot = layout.parentEdges.find(
      ({ fromLane, toLane }) => fromLane === 1 && toLane === 0
    );
    expect(featureToRoot?.color).toBe(laneColorVar(0));
  });

  it('emits continuous vertical lines only between consecutive same-lane commits', () => {
    const commits = [
      createCommit('c', ['b'], 4, { branches: ['main'] }),
      createCommit('b', ['a'], 3, { branches: ['main'] }),
      createCommit('a', [], 2, { branches: ['main'] })
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

  it('does not draw a lane past its branch tip (no commits left on the lane)', () => {
    const commits = [
      createCommit('merge', ['m2', 'feat-tip'], 7, {
        branches: ['main'],
        isCurrentBranch: true,
        currentBranchName: 'main'
      }),
      createCommit('m2', ['m1'], 6, { branches: ['main'] }),
      createCommit('feat-tip', ['f1'], 5, { branches: ['feature-x'] }),
      createCommit('m1', [], 4, { branches: ['main'] }),
      createCommit('f1', [], 3, { branches: ['feature-x'] })
    ];

    const layout = computeLayout(commits);

    const featureLines = layout.continuousLines.filter(
      ({ fromLane, toLane }) => fromLane === 1 && toLane === 1
    );
    expect(featureLines).toHaveLength(1);

    const featureLine = featureLines[0];
    expect(featureLine).toEqual({
      fromLane: 1,
      toLane: 1,
      fromY: rowCenterY(2),
      toY: rowCenterY(4),
      color: laneColorVar(1)
    });

    const lastFeatureRowY = Math.max(
      ...layout.rows
        .filter(({ lane }) => lane === 1)
        .map((row) => rowCenterY(layout.rows.indexOf(row)))
    );
    const overflow = layout.continuousLines.filter(
      ({ fromLane, toLane, toY }) =>
        fromLane === 1 && toLane === 1 && toY > lastFeatureRowY
    );
    expect(overflow).toEqual([]);
  });

  it('does not generate parent edges for parents outside the visible set', () => {
    const commits = [
      createCommit('first', ['second', 'outside'], 2, {
        branches: ['main']
      }),
      createCommit('second', [], 1, { branches: ['main'] })
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
    expect(layout.parentEdges).toHaveLength(0);
  });

  it('keeps a commit in its lane when its first parent is on the same lane', () => {
    const commits = [
      createCommit('top', ['middle'], 3, { branches: ['main'] }),
      createCommit('middle', ['bottom'], 2, { branches: ['main'] }),
      createCommit('bottom', [], 1, { branches: ['main'] })
    ];

    const layout = computeLayout(commits);

    expect(layout.rows.every(({ lane }) => lane === 0)).toBe(true);
    expect(layout.continuousLines).toHaveLength(2);
    expect(layout.parentEdges).toHaveLength(0);
  });

  it('uses absolute y-coordinates derived from row index and ROW_HEIGHT', () => {
    const commits = [
      createCommit('first', ['second'], 2, { branches: ['main'] }),
      createCommit('second', [], 1, { branches: ['main'] })
    ];

    const layout = computeLayout(commits);

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

  it('assigns a unique css-variable color to each lane from the 8-color palette', () => {
    const commits = [
      createCommit('top', ['m1', 'f1', 'd1'], 7, {
        branches: ['main'],
        isCurrentBranch: true,
        currentBranchName: 'main'
      }),
      createCommit('m1', [], 6, { branches: ['main'] }),
      createCommit('f1', [], 5, { branches: ['feat-a'] }),
      createCommit('d1', [], 4, { branches: ['docs'] })
    ];

    const layout = computeLayout(commits);

    expect(layout.lanes.map(({ index, color }) => [index, color])).toEqual([
      [0, 'var(--color-graph-lane-1)'],
      [1, 'var(--color-graph-lane-2)'],
      [2, 'var(--color-graph-lane-3)']
    ]);
  });

  it('marks the head-branch lineage as active', () => {
    const commits = [
      createCommit('merge', ['main-tip', 'feature-tip'], 5, {
        branches: ['main'],
        isCurrentBranch: true,
        currentBranchName: 'main'
      }),
      createCommit('main-tip', ['root'], 4, { branches: ['main'] }),
      createCommit('feature-tip', ['root'], 3, { branches: ['feature'] }),
      createCommit('root', [], 2, { branches: ['main'] })
    ];

    const layout = computeLayout(commits);

    expect(
      layout.rows.map(({ commit, active }) => [commit.hash, active])
    ).toEqual([
      ['merge', true],
      ['main-tip', true],
      ['feature-tip', false],
      ['root', true]
    ]);
    expect(
      layout.rows[0]?.parents.map(({ hash, active }) => [hash, active])
    ).toEqual([
      ['main-tip', true],
      ['feature-tip', false]
    ]);
  });

  it('produces total height equal to rows.length * ROW_HEIGHT', () => {
    const commits = [
      createCommit('a', ['b'], 3, { branches: ['main'] }),
      createCommit('b', ['c'], 2, { branches: ['main'] }),
      createCommit('c', [], 1, { branches: ['main'] })
    ];

    const layout = computeLayout(commits);

    expect(layout.height).toBe(layout.rows.length * ROW_HEIGHT);
  });

  it('sets width to GRAPH_WIDTH + maxLane * LANE_WIDTH', () => {
    const commits = [
      createCommit('merge', ['main-tip', 'feature-tip'], 5, {
        branches: ['main'],
        isCurrentBranch: true,
        currentBranchName: 'main'
      }),
      createCommit('main-tip', ['root'], 4, { branches: ['main'] }),
      createCommit('feature-tip', ['root'], 3, { branches: ['feature'] }),
      createCommit('root', [], 2, { branches: ['main'] })
    ];

    const layout = computeLayout(commits);

    expect(layout.maxLane).toBe(1);
    expect(layout.width).toBe(32 + 1 * 14);
  });

  it('uses ROW_HEIGHT=32 for compact single-row rendering', () => {
    expect(ROW_HEIGHT).toBe(32);
  });
});

describe('computeLayout with first-parent branch mainlines', () => {
  it('places commits only on fix/graph-edges onto lane 1 (SourceTree-style)', () => {
    const commits = [
      createCommit('9492415', ['942792f'], 11, {
        branches: ['fix/graph-edges']
      }),
      createCommit('942792f', ['d890d7c'], 10, {
        branches: ['fix/graph-edges']
      }),
      createCommit('d890d7c', ['f0acacf'], 9, {
        branches: ['fix/graph-edges']
      }),
      createCommit('f0acacf', ['d9d173f'], 8, {
        branches: ['fix/graph-edges']
      }),
      createCommit('d9d173f', ['0d44d2c'], 7, {
        branches: ['fix/graph-edges']
      }),
      createCommit('0d44d2c', ['522f78f'], 6, {
        branches: ['fix/graph-edges']
      }),
      createCommit('522f78f', ['44cd7e0'], 5, {
        branches: ['fix/graph-edges']
      }),
      createCommit('44cd7e0', ['d7a04f8'], 4, {
        branches: ['fix/graph-edges']
      }),
      createCommit('d7a04f8', ['937bdde'], 3, {
        branches: ['main', 'fix/graph-edges'],
        isCurrentBranch: true,
        currentBranchName: 'fix/graph-edges'
      }),
      createCommit('937bdde', ['070e3d1'], 2, {
        branches: ['main', 'fix/graph-edges']
      }),
      createCommit('070e3d1', [], 1, {
        branches: ['main', 'fix/graph-edges']
      })
    ];

    const layout = computeLayout(commits, {
      currentBranchName: 'fix/graph-edges',
      branchMainlines: [
        {
          name: 'main',
          commits: ['d7a04f8', '937bdde', '070e3d1']
        },
        {
          name: 'fix/graph-edges',
          commits: [
            '9492415',
            '942792f',
            'd890d7c',
            'f0acacf',
            'd9d173f',
            '0d44d2c',
            '522f78f',
            '44cd7e0',
            'd7a04f8',
            '937bdde',
            '070e3d1'
          ]
        }
      ]
    });

    const laneByHash = new Map(
      layout.rows.map(({ commit, lane }) => [commit.hash, lane])
    );

    expect(laneByHash.get('9492415')).toBe(1);
    expect(laneByHash.get('942792f')).toBe(1);
    expect(laneByHash.get('44cd7e0')).toBe(1);
    expect(laneByHash.get('d7a04f8')).toBe(0);
    expect(laneByHash.get('937bdde')).toBe(0);
    expect(laneByHash.get('070e3d1')).toBe(0);
  });

  it('assigns the merge commit to main lane (closer to main tip) when not on current branch', () => {
    const commits = [
      createCommit('9492415', ['942792f'], 11, {
        branches: ['fix/graph-edges']
      }),
      createCommit('942792f', ['d890d7c'], 10, {
        branches: ['fix/graph-edges']
      }),
      createCommit('d890d7c', ['f0acacf'], 9, {
        branches: ['fix/graph-edges']
      }),
      createCommit('f0acacf', ['d9d173f'], 8, {
        branches: ['fix/graph-edges']
      }),
      createCommit('d9d173f', ['0d44d2c'], 7, {
        branches: ['fix/graph-edges']
      }),
      createCommit('0d44d2c', ['522f78f'], 6, {
        branches: ['fix/graph-edges']
      }),
      createCommit('522f78f', ['44cd7e0'], 5, {
        branches: ['fix/graph-edges']
      }),
      createCommit('44cd7e0', ['d7a04f8'], 4, {
        branches: ['fix/graph-edges']
      }),
      createCommit('d7a04f8', ['937bdde'], 3, {
        branches: ['main', 'fix/graph-edges']
      }),
      createCommit('937bdde', ['070e3d1'], 2, {
        branches: ['main', 'fix/graph-edges']
      }),
      createCommit('070e3d1', [], 1, {
        branches: ['main']
      })
    ];

    const layout = computeLayout(commits, {
      currentBranchName: 'main',
      branchMainlines: [
        {
          name: 'main',
          commits: ['d7a04f8', '937bdde', '070e3d1']
        },
        {
          name: 'fix/graph-edges',
          commits: [
            '9492415',
            '942792f',
            'd890d7c',
            'f0acacf',
            'd9d173f',
            '0d44d2c',
            '522f78f',
            '44cd7e0',
            'd7a04f8',
            '937bdde',
            '070e3d1'
          ]
        }
      ]
    });

    const laneByHash = new Map(
      layout.rows.map(({ commit, lane }) => [commit.hash, lane])
    );

    expect(laneByHash.get('d7a04f8')).toBe(0);
    expect(laneByHash.get('9492415')).toBe(1);
    expect(laneByHash.get('070e3d1')).toBe(0);
  });

  it('puts worktree side-branch commits on their own lane when not in any first-parent mainline', () => {
    const commits = [
      createCommit('9492415', ['b0606c3'], 6, {
        branches: ['fix/graph-edges']
      }),
      createCommit('b0606c3', ['3b813b3'], 5, {
        branches: ['worktree-x']
      }),
      createCommit('3b813b3', ['541e1cd'], 4, {
        branches: ['worktree-x']
      }),
      createCommit('541e1cd', ['6546605'], 3, {
        branches: ['worktree-x']
      }),
      createCommit('6546605', ['e2de032'], 2, {
        branches: ['worktree-x']
      }),
      createCommit('e2de032', [], 1, {
        branches: ['worktree-x']
      })
    ];

    const layout = computeLayout(commits, {
      currentBranchName: 'fix/graph-edges',
      branchMainlines: [
        {
          name: 'fix/graph-edges',
          commits: ['9492415']
        }
      ]
    });

    const laneByHash = new Map(
      layout.rows.map(({ commit, lane }) => [commit.hash, lane])
    );

    expect(laneByHash.get('9492415')).toBe(0);
    expect(laneByHash.get('b0606c3')).not.toBe(laneByHash.get('9492415'));
    expect(laneByHash.get('3b813b3')).toBe(laneByHash.get('b0606c3'));
    expect(laneByHash.get('541e1cd')).toBe(laneByHash.get('b0606c3'));
    expect(laneByHash.get('6546605')).toBe(laneByHash.get('b0606c3'));
    expect(laneByHash.get('e2de032')).toBe(laneByHash.get('b0606c3'));
  });

  it('places tip-of-branch commits on their own branch lane (priority 2)', () => {
    const commits = [
      createCommit('feat-tip', ['feat-mid'], 3, {
        branches: ['feature-x']
      }),
      createCommit('feat-mid', ['root'], 2, {
        branches: ['feature-x']
      }),
      createCommit('root', [], 1, {
        branches: ['main'],
        isCurrentBranch: true,
        currentBranchName: 'main'
      })
    ];

    const layout = computeLayout(commits, {
      currentBranchName: 'main',
      branchMainlines: [
        {
          name: 'main',
          commits: ['root']
        },
        {
          name: 'feature-x',
          commits: ['feat-tip', 'feat-mid', 'root']
        }
      ]
    });

    const laneByHash = new Map(
      layout.rows.map(({ commit, lane }) => [commit.hash, lane])
    );

    expect(laneByHash.get('root')).toBe(0);
    expect(laneByHash.get('feat-tip')).toBe(1);
    expect(laneByHash.get('feat-mid')).toBe(1);
  });

  it('handles a simple linear history with one branch mainline', () => {
    const commits = [
      createCommit('c', ['b'], 3, { branches: ['main'] }),
      createCommit('b', ['a'], 2, { branches: ['main'] }),
      createCommit('a', [], 1, { branches: ['main'] })
    ];

    const layout = computeLayout(commits, {
      currentBranchName: 'main',
      branchMainlines: [
        {
          name: 'main',
          commits: ['c', 'b', 'a']
        }
      ]
    });

    expect(layout.rows.map(({ lane }) => lane)).toEqual([0, 0, 0]);
    expect(layout.maxLane).toBe(0);
  });

  it('returns stable layout when branchMainlines is not provided (fallback to commit.branches)', () => {
    const commits = [
      createCommit('merge', ['main-tip', 'feat-tip'], 5, {
        branches: ['main'],
        isCurrentBranch: true,
        currentBranchName: 'main'
      }),
      createCommit('main-tip', ['root'], 4, { branches: ['main'] }),
      createCommit('feat-tip', ['root'], 3, { branches: ['feature-x'] }),
      createCommit('root', [], 2, { branches: ['main'] })
    ];

    const layout = computeLayout(commits);

    const laneByHash = new Map(
      layout.rows.map(({ commit, lane }) => [commit.hash, lane])
    );
    expect(laneByHash.get('merge')).toBe(0);
    expect(laneByHash.get('main-tip')).toBe(0);
    expect(laneByHash.get('feat-tip')).toBe(1);
    expect(laneByHash.get('root')).toBe(0);
  });
});