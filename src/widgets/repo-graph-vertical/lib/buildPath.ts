import { GRAPH_WIDTH, LANE_WIDTH } from './computeLayout';
import type { GraphLine } from '../types';

const laneCenter = (lane: number): number =>
  GRAPH_WIDTH / 2 + lane * LANE_WIDTH;

export const buildPath = (line: GraphLine): string => {
  const fromX = laneCenter(line.fromLane);
  const toX = laneCenter(line.toLane);

  if (fromX === toX) {
    return `M ${fromX} ${line.fromY} L ${toX} ${line.toY}`;
  }

  const midY = (line.fromY + line.toY) / 2;

  return `M ${fromX} ${line.fromY} C ${fromX} ${midY} ${toX} ${midY} ${toX} ${line.toY}`;
};
