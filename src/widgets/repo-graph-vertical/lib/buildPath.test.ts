import { describe, expect, it } from 'vitest';

import type { GraphLine } from '../types';

import { buildPath } from './buildPath';

const CURVE_PATTERN = /[QqCcSsTtAa]/;

describe('buildPath', () => {
  it('emits only M and L commands', () => {
    const lines: GraphLine[] = [
      { fromLane: 0, toLane: 0, rowDistance: 1, color: 'red' },
      { fromLane: 0, toLane: 1, rowDistance: 2, color: 'red' },
      { fromLane: 2, toLane: 1, rowDistance: 3, color: 'red' },
      { fromLane: 1, toLane: 1, rowDistance: 4, color: 'red' }
    ];

    for (const line of lines) {
      const path = buildPath(line);
      expect(path).not.toMatch(CURVE_PATTERN);
      expect(path).toMatch(/^M [\d.-]+ [\d.-]+/);
      expect(path).toContain(' L ');
      expect(path.split(' L ').length).toBeGreaterThanOrEqual(2);
    }
  });

  it('produces a straight vertical segment when source and target lanes match', () => {
    const path = buildPath({
      fromLane: 1,
      toLane: 1,
      rowDistance: 2,
      color: 'red'
    });

    expect(path.startsWith('M')).toBe(true);
    expect(path.split(' L ')).toHaveLength(2);
  });

  it('produces a Manhattan step with one horizontal segment when lanes differ', () => {
    const path = buildPath({
      fromLane: 0,
      toLane: 1,
      rowDistance: 1,
      color: 'red'
    });

    const segments = path.split(' L ');
    expect(segments).toHaveLength(4);
  });
});
