import { describe, expect, it } from 'vitest';

import { ROW_HEIGHT } from './computeLayout';
import type { GraphLine } from '../types';

import { buildPath } from './buildPath';

const LANE_OFFSET = 16;
const LANE_WIDTH = 14;

const laneCenter = (lane: number): number => LANE_OFFSET + lane * LANE_WIDTH;

describe('buildPath', () => {
  it('emits straight same-lane segment using absolute coordinates', () => {
    const line: GraphLine = {
      fromLane: 1,
      toLane: 1,
      fromY: 48,
      toY: 80,
      color: 'red'
    };

    const path = buildPath(line);

    expect(path).toMatch(
      new RegExp(`^M ${laneCenter(1)} 48 L ${laneCenter(1)} 80$`)
    );
    expect(path).not.toMatch(/[CcQqSsTtAa]/);
  });

  it('emits cubic Bezier for diff-lane with midY at (fromY+toY)/2', () => {
    const line: GraphLine = {
      fromLane: 0,
      toLane: 1,
      fromY: ROW_HEIGHT / 2,
      toY: ROW_HEIGHT + ROW_HEIGHT / 2,
      color: 'red'
    };

    const path = buildPath(line);
    const midY = (line.fromY + line.toY) / 2;
    const fromX = laneCenter(0);
    const toX = laneCenter(1);
    const match = path.match(
      new RegExp(`^M ${fromX} ${line.fromY} C ${fromX} ${midY} ${toX} ${midY} ${toX} ${line.toY}$`)
    );

    expect(match).not.toBeNull();
    expect(midY).toBe(ROW_HEIGHT);
  });

  it('emits only a single C command for diff-lane segments', () => {
    const line: GraphLine = {
      fromLane: 0,
      toLane: 1,
      fromY: 0,
      toY: 100,
      color: 'red'
    };

    const path = buildPath(line);
    const cCount = (path.match(/[Cc]/g) ?? []).length;

    expect(cCount).toBe(1);
    expect(path).not.toMatch(/[QqSsTtAa]/);
  });

  it('uses absolute fromY and toY values without clamping', () => {
    const line: GraphLine = {
      fromLane: 0,
      toLane: 0,
      fromY: 123.5,
      toY: 987.25,
      color: 'red'
    };

    const path = buildPath(line);

    expect(path).toMatch(
      new RegExp(`^M ${laneCenter(0)} 123\\.5 L ${laneCenter(0)} 987\\.25$`)
    );
  });

  it('handles descending diff-lane curves with midY at the average', () => {
    const line: GraphLine = {
      fromLane: 2,
      toLane: 0,
      fromY: 200,
      toY: 50,
      color: 'red'
    };

    const path = buildPath(line);
    const midY = (200 + 50) / 2;
    const fromX = laneCenter(2);
    const toX = laneCenter(0);

    expect(path).toMatch(
      new RegExp(`^M ${fromX} 200 C ${fromX} ${midY} ${toX} ${midY} ${toX} 50$`)
    );
  });

  it('produces degenerate but valid diff-lane path when fromY equals toY', () => {
    const line: GraphLine = {
      fromLane: 0,
      toLane: 1,
      fromY: 64,
      toY: 64,
      color: 'red'
    };

    const path = buildPath(line);
    const fromX = laneCenter(0);
    const toX = laneCenter(1);

    expect(path).toMatch(
      new RegExp(`^M ${fromX} 64 C ${fromX} 64 ${toX} 64 ${toX} 64$`)
    );
  });
});
