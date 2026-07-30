import { describe, expect, it } from 'vitest';

import { ROW_HEIGHT } from './computeLayout';
import type { GraphLine } from '../types';

import { buildPath } from './buildPath';

describe('buildPath', () => {
  it('emits outgoing same-lane segment from row center to row bottom', () => {
    const path = buildPath({
      fromLane: 1,
      toLane: 1,
      rowDistance: 1,
      color: 'red',
      direction: 'outgoing'
    });

    expect(path).not.toMatch(/[CcQqSsTtAa]/);
    expect(path).toMatch(/^M \d+ 16 L \d+ 32$/);
  });

  it('emits outgoing diff-lane cubic Bezier with midY at 3*ROW_HEIGHT/4', () => {
    const line: GraphLine = {
      fromLane: 0,
      toLane: 1,
      rowDistance: 1,
      color: 'red',
      direction: 'outgoing'
    };

    const path = buildPath(line);
    const midY = (ROW_HEIGHT / 2 + ROW_HEIGHT) / 2;
    const match = path.match(
      /^M (\d+) 16 C (\d+) 24 (\d+) 24 (\d+) 32$/
    );

    expect(match).not.toBeNull();
    expect(Number(match?.[1])).toBe(Number(match?.[2]));
    expect(Number(match?.[3])).toBe(Number(match?.[4]));
    expect(midY).toBe(24);
  });

  it('emits incoming same-lane segment from row top to row center', () => {
    const path = buildPath({
      fromLane: 0,
      toLane: 0,
      rowDistance: 1,
      color: 'red',
      direction: 'incoming'
    });

    expect(path).not.toMatch(/[CcQqSsTtAa]/);
    expect(path).toMatch(/^M \d+ 0 L \d+ 16$/);
  });

  it('emits incoming diff-lane cubic Bezier with midY at ROW_HEIGHT/4', () => {
    const line: GraphLine = {
      fromLane: 0,
      toLane: 1,
      rowDistance: 1,
      color: 'red',
      direction: 'incoming'
    };

    const path = buildPath(line);
    const match = path.match(/^M (\d+) 0 C (\d+) 8 (\d+) 8 (\d+) 16$/);

    expect(match).not.toBeNull();
    expect(Number(match?.[1])).toBe(Number(match?.[2]));
    expect(Number(match?.[3])).toBe(Number(match?.[4]));
  });

  it('clamps outgoing diff-lane toY to ROW_HEIGHT when rowDistance > 1', () => {
    const path = buildPath({
      fromLane: 0,
      toLane: 1,
      rowDistance: 5,
      color: 'red',
      direction: 'outgoing'
    });

    const match = path.match(/C [\d.-]+ [\d.-]+ [\d.-]+ [\d.-]+ [\d.-]+ ([\d.-]+)$/);
    expect(match?.[1]).toBe(String(ROW_HEIGHT));
  });

  it('clamps outgoing same-lane toY to ROW_HEIGHT when rowDistance > 1', () => {
    const path = buildPath({
      fromLane: 1,
      toLane: 1,
      rowDistance: 4,
      color: 'red',
      direction: 'outgoing'
    });

    const match = path.match(/L [\d.-]+ ([\d.-]+)$/);
    expect(match?.[1]).toBe(String(ROW_HEIGHT));
  });

  it('clamps incoming diff-lane toY to ROW_HEIGHT/2 when rowDistance > 1', () => {
    const path = buildPath({
      fromLane: 0,
      toLane: 1,
      rowDistance: 5,
      color: 'red',
      direction: 'incoming'
    });

    const match = path.match(/C [\d.-]+ [\d.-]+ [\d.-]+ [\d.-]+ [\d.-]+ ([\d.-]+)$/);
    expect(match?.[1]).toBe(String(ROW_HEIGHT / 2));
  });

  it('clamps incoming same-lane toY to ROW_HEIGHT/2 when rowDistance > 1', () => {
    const path = buildPath({
      fromLane: 1,
      toLane: 1,
      rowDistance: 4,
      color: 'red',
      direction: 'incoming'
    });

    const match = path.match(/L [\d.-]+ ([\d.-]+)$/);
    expect(match?.[1]).toBe(String(ROW_HEIGHT / 2));
  });

  it('emits no quadratic curves for diff-lane segments', () => {
    const line: GraphLine = {
      fromLane: 0,
      toLane: 1,
      rowDistance: 1,
      color: 'red',
      direction: 'outgoing'
    };

    const path = buildPath(line);
    expect(path).not.toMatch(/[Qq]/);
  });

  it('produces a degenerate but render-safe incoming path when rowDistance is 0', () => {
    const path = buildPath({
      fromLane: 0,
      toLane: 1,
      rowDistance: 0,
      color: 'red',
      direction: 'incoming'
    });

    expect(path).toMatch(/^M [\d.-]+ 0 C [\d.-]+ [\d.-]+ [\d.-]+ [\d.-]+ [\d.-]+ [\d.-]+$/);
    expect(path).not.toMatch(/[Qq]/);
  });
});
