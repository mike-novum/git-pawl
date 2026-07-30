import { GRAPH_WIDTH, LANE_WIDTH, ROW_HEIGHT } from './computeLayout';
import type { GraphLine } from '../types';

const laneCenter = (lane: number): number =>
  GRAPH_WIDTH / 2 + lane * LANE_WIDTH;

export const buildPath = (line: GraphLine): string => {
  const fromX = laneCenter(line.fromLane);
  const toX = laneCenter(line.toLane);
  const isOutgoing = line.direction === 'outgoing';
  const fromY = isOutgoing ? ROW_HEIGHT / 2 : 0;
  const toY = isOutgoing ? ROW_HEIGHT : ROW_HEIGHT / 2;
  const midY = isOutgoing ? (ROW_HEIGHT / 2 + ROW_HEIGHT) / 2 : ROW_HEIGHT / 4;

  if (fromX === toX) {
    return `M ${fromX} ${fromY} L ${toX} ${toY}`;
  }

  return `M ${fromX} ${fromY} C ${fromX} ${midY} ${toX} ${midY} ${toX} ${toY}`;
};
