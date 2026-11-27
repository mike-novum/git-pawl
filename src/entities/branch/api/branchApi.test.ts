import { describe, expect, it } from 'vitest';

import { buildBranches } from './branchApi';

describe('buildBranches', () => {
  it('keeps legacy branch-name payloads usable', () => {
    expect(buildBranches(['main'], 'main', false)).toEqual([
      {
        name: 'main',
        target: '',
        current: true,
        commits: [],
        upstream: undefined
      }
    ]);
  });

  it('preserves commits arrays from the new IPC payload', () => {
    expect(
      buildBranches(
        [
          { name: 'main', target: 'aaa', commits: ['aaa', 'ccc'] },
          { name: 'feature-x', target: 'bbb', commits: ['bbb', 'ccc'] }
        ],
        'main',
        false
      )
    ).toEqual([
      {
        name: 'main',
        target: 'aaa',
        current: true,
        commits: ['aaa', 'ccc'],
        upstream: undefined
      },
      {
        name: 'feature-x',
        target: 'bbb',
        current: false,
        commits: ['bbb', 'ccc'],
        upstream: undefined
      }
    ]);
  });

  it('defaults commits to empty array when missing on a raw branch', () => {
    expect(
      buildBranches(
        [{ name: 'main', target: 'aaa', commits: [] }],
        'main',
        false
      )
    ).toEqual([
      {
        name: 'main',
        target: 'aaa',
        current: true,
        commits: [],
        upstream: undefined
      }
    ]);
  });

  it('attaches currentUpstream from gitStatus to the current branch', () => {
    expect(
      buildBranches(
        [
          { name: 'main', target: 'aaa', commits: ['aaa'] },
          { name: 'feat/ux', target: 'bbb', commits: ['bbb'] }
        ],
        'feat/ux',
        false,
        { ref: 'origin/feat/ux', ahead: 2, behind: 1 }
      )
    ).toEqual([
      {
        name: 'main',
        target: 'aaa',
        current: false,
        commits: ['aaa'],
        upstream: undefined
      },
      {
        name: 'feat/ux',
        target: 'bbb',
        current: true,
        commits: ['bbb'],
        upstream: { ref: 'origin/feat/ux', ahead: 2, behind: 1 }
      }
    ]);
  });
});
