import { GRAPH_WIDTH, LANE_WIDTH, ROW_HEIGHT } from './computeLayout';
import type { GraphLine } from '../types';

const CORNER_RADIUS = 5;

const laneCenter = (lane: number): number =>
  GRAPH_WIDTH / 2 + lane * LANE_WIDTH;

export const buildPath = (line: GraphLine): string => {
  const fromX = laneCenter(line.fromLane);
  const toX = laneCenter(line.toLane);
  const fromY = ROW_HEIGHT / 2;
  const rawToY = fromY + line.rowDistance * ROW_HEIGHT;
  const toY = Math.min(rawToY, fromY + ROW_HEIGHT);
  const midY = fromY + ROW_HEIGHT / 2;

  if (fromX === toX) {
    return `M ${fromX} ${fromY} L ${toX} ${toY}`;
  }

  const laneDiff = Math.abs(toX - fromX);
  if (laneDiff < 2 * CORNER_RADIUS) {
    return [
      `M ${fromX} ${fromY}`,
      `L ${fromX} ${midY}`,
      `L ${toX} ${midY}`,
      `L ${toX} ${toY}`
    ].join(' ');
  }

  const dir = toX > fromX ? 1 : -1;

  return [
    `M ${fromX} ${fromY}`,
    `L ${fromX} ${midY - CORNER_RADIUS}`,
    `Q ${fromX} ${midY} ${fromX + dir * CORNER_RADIUS} ${midY}`,
    `L ${toX - dir * CORNER_RADIUS} ${midY}`,
    `Q ${toX} ${midY} ${toX} ${midY + CORNER_RADIUS}`,
    `L ${toX} ${toY}`
  ].join(' ');
};