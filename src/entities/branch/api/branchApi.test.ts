import { describe, expect, it } from 'vitest';

import { buildBranches } from './branchApi';

describe('buildBranches', () => {
  it('keeps legacy branch-name payloads usable', () => {
    expect(buildBranches(['main'], 'main', false)).toEqual([
      {
        name: 'main',
        target: '',
        current: true,
        upstream: undefined
      }
    ]);
  });
});
