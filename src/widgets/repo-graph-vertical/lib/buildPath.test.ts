import { describe, expect, it } from 'vitest';

import { ROW_HEIGHT } from './computeLayout';
import type { GraphLine } from '../types';

import { buildPath } from './buildPath';

const NEXT_ROW_CENTER = ROW_HEIGHT / 2 + ROW_HEIGHT;
const EXPECTED_MID_Y = ROW_HEIGHT / 2 + ROW_HEIGHT / 2;

describe('buildPath', () => {
  it('emits only M and L commands for same-lane segments', () => {
    const lines: GraphLine[] = [
      { fromLane: 0, toLane: 0, rowDistance: 1, color: 'red' },
      { fromLane: 1, toLane: 1, rowDistance: 4, color: 'red' }
    ];

    for (const line of lines) {
      const path = buildPath(line);
      expect(path).not.toMatch(/[CcQqSsTtAa]/);
      expect(path).toMatch(/^M [\d.-]+ [\d.-]+ L [\d.-]+ [\d.-]+$/);
    }
  });

  it('uses exactly one cubic Bezier and no quadratic for diff-lane segments', () => {
    const line: GraphLine = {
      fromLane: 0,
      toLane: 1,
      rowDistance: 1,
      color: 'red'
    };

    const path = buildPath(line);

    const cubicMatches = path.match(/C/g) ?? [];
    expect(cubicMatches).toHaveLength(1);
    expect(path).not.toMatch(/[Qq]/);
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

  it('produces a valid S-curve with midY at row center for rowDistance = 1', () => {
    const path = buildPath({
      fromLane: 0,
      toLane: 2,
      rowDistance: 1,
      color: 'red'
    });

    const match = path.match(
      /^M ([\d.-]+) ([\d.-]+) C ([\d.-]+) ([\d.-]+) ([\d.-]+) ([\d.-]+) ([\d.-]+) ([\d.-]+)$/
    );

    expect(match).not.toBeNull();
    const [, mX, , c1X, c1Y, c2X, c2Y, eX, eY] = match as RegExpMatchArray;

    expect(Number(c1Y)).toBe(EXPECTED_MID_Y);
    expect(Number(c2Y)).toBe(EXPECTED_MID_Y);
    expect(Number(c1X)).toBe(Number(mX));
    expect(Number(c2X)).toBe(Number(eX));
    expect(Number(eY)).toBe(EXPECTED_MID_Y + ROW_HEIGHT / 2);
  });

  it('clamps toY to the next row center when rowDistance > 1 for diff-lane segments', () => {
    const path = buildPath({
      fromLane: 0,
      toLane: 1,
      rowDistance: 5,
      color: 'red'
    });

    const match = path.match(/C [\d.-]+ [\d.-]+ [\d.-]+ [\d.-]+ [\d.-]+ ([\d.-]+)$/);
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

  it('produces a degenerate but render-safe path when rowDistance is 0', () => {
    const path = buildPath({
      fromLane: 0,
      toLane: 1,
      rowDistance: 0,
      color: 'red'
    });

    expect(path).toMatch(/^M [\d.-]+ [\d.-]+ C [\d.-]+ [\d.-]+ [\d.-]+ [\d.-]+ [\d.-]+ [\d.-]+$/);
    expect(path).not.toMatch(/[Qq]/);
  });
});