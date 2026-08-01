import { memo, type FC } from 'react';

import { buildPath } from '../lib/buildPath';
import { GRAPH_WIDTH, LANE_WIDTH, ROW_HEIGHT } from '../lib/computeLayout';

import type { GraphLayerProps } from '../types';

const NODE_RADIUS = 5;
const NODE_HALO_RADIUS = 9;

const laneCenter = (lane: number): number =>
  GRAPH_WIDTH / 2 + lane * LANE_WIDTH;

const rowCenterY = (rowIndex: number): number =>
  rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2;

const GraphLayerComponent: FC<GraphLayerProps> = ({
  layout,
  selectedHash
}) => {
  const { width, height, rows, continuousLines, parentEdges } = layout;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: 'absolute', top: 0, left: 0 }}
      overflow="visible"
      aria-hidden="true"
    >
      {continuousLines.map((line, lineIndex) => (
        <path
          key={`continuous-${lineIndex}`}
          d={buildPath(line)}
          fill="none"
          stroke={line.color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {parentEdges.map((edge, edgeIndex) => (
        <path
          key={`parent-${edgeIndex}`}
          d={buildPath(edge)}
          fill="none"
          stroke={edge.color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {rows.map((row, rowIndex) => {
        const isSelected = row.commit.hash === selectedHash;
        const cx = laneCenter(row.lane);
        const cy = rowCenterY(rowIndex);

        return (
          <g key={`node-${row.commit.hash}`}>
            {isSelected ? (
              <circle
                cx={cx}
                cy={cy}
                r={NODE_HALO_RADIUS}
                fill="none"
                stroke="var(--color-primary)"
                strokeOpacity={0.4}
                strokeWidth={1}
              />
            ) : null}
            <circle
              cx={cx}
              cy={cy}
              r={NODE_RADIUS}
              className="[transform-box:fill-box] origin-center transition-transform duration-fast ease-out group-hover:scale-[1.2]"
              fill={row.commit.color ?? 'var(--color-graph-lane-1)'}
              stroke="var(--color-surface)"
              strokeWidth={2}
            />
          </g>
        );
      })}
    </svg>
  );
};

export const GraphLayer = memo(GraphLayerComponent);
GraphLayer.displayName = 'GraphLayer';
