const LANE_PALETTE_SIZE = 8;

export const laneColor = (laneIndex: number): string => {
  const paletteIndex = ((laneIndex % LANE_PALETTE_SIZE) + LANE_PALETTE_SIZE) % LANE_PALETTE_SIZE;
  return `var(--color-graph-lane-${paletteIndex + 1})`;
};