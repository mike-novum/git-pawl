import { describe, expect, it } from 'vitest';

import { ROW_HEIGHT } from './computeLayout';
import type { GraphLine } from '../types';

import { buildPath } from './buildPath';

const OTHER_CURVE_PATTERN = /[CcSsTtAa]/;
const NEXT_ROW_CENTER = ROW_HEIGHT / 2 + ROW_HEIGHT;

describe('buildPath', () => {
  it('emits only M and L commands for same-lane segments', () => {
    const lines: GraphLine[] = [
      { fromLane: 0, toLane: 0, rowDistance: 1, color: 'red' },
      { fromLane: 1, toLane: 1, rowDistance: 4, color: 'red' }
    ];

    for (const line of lines) {
      const path = buildPath(line);
      expect(path).not.toMatch(OTHER_CURVE_PATTERN);
      expect(path).not.toMatch(/[Qq]/);
      expect(path).toMatch(/^M [\d.-]+ [\d.-]+ L [\d.-]+ [\d.-]+$/);
    }
  });

  it('uses quadratic Bezier curves at corners when lanes differ by enough', () => {
    const path = buildPath({
      fromLane: 0,
      toLane: 1,
      rowDistance: 1,
      color: 'red'
    });

    expect(path).toMatch(/[Qq]/);
    expect(path).not.toMatch(OTHER_CURVE_PATTERN);
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

  it('produces a curved horizontal step when lanes differ', () => {
    const path = buildPath({
      fromLane: 0,
      toLane: 1,
      rowDistance: 1,
      color: 'red'
    });

    const segments = path.split(' L ');
    expect(segments).toHaveLength(4);
  });

  it('falls back to a straight Manhattan path when lanes differ by less than 2*CORNER_RADIUS', () => {
    const path = buildPath({
      fromLane: 0,
      toLane: 0.3,
      rowDistance: 1,
      color: 'red'
    });

    expect(path).not.toMatch(/[Qq]/);
    expect(path.split(' L ')).toHaveLength(4);
  });

  it('clamps toY to the next row center when rowDistance > 1', () => {
    const path = buildPath({
      fromLane: 0,
      toLane: 1,
      rowDistance: 5,
      color: 'red'
    });

    const match = path.match(/L [\d.-]+ ([\d.-]+)$/);
    expect(match?.[1]).toBe(String(NEXT_ROW_CENTER));
  });

  it('clamps toY for long same-lane segments', () => {
    const path = buildPath({
      fromLane: 1,
      toLane: 1,
      rowDistance: 4,
      color: 'red'
    });

    const match = path.match(/L [\d.-]+ ([\d.-]+)$/);
    expect(match?.[1]).toBe(String(NEXT_ROW_CENTER));
  });
});