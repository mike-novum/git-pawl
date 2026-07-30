import { GRAPH_WIDTH, LANE_WIDTH, ROW_HEIGHT } from './computeLayout';
import type { GraphLine } from '../types';

const laneCenter = (lane: number): number =>
  GRAPH_WIDTH / 2 + lane * LANE_WIDTH;

export const buildPath = (line: GraphLine): string => {
  const fromX = laneCenter(line.fromLane);
  const toX = laneCenter(line.toLane);
  const fromY = ROW_HEIGHT / 2;
  const toY = fromY + line.rowDistance * ROW_HEIGHT;
  const midY = fromY + ROW_HEIGHT / 2;

  if (fromX === toX) {
    return `M ${fromX} ${fromY} L ${toX} ${toY}`;
  }

  return [
    `M ${fromX} ${fromY}`,
    `L ${fromX} ${midY}`,
    `L ${toX} ${midY}`,
    `L ${toX} ${toY}`
  ].join(' ');
};
