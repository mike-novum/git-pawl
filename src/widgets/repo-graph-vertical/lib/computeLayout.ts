import type {
  CommitNode,
  GraphLane,
  GraphLayout,
  GraphLine,
  GraphParent,
  GraphRow
} from '../types';
import { laneColor } from './laneColor';

export const ROW_HEIGHT = 32;
export const LANE_WIDTH = 14;
export const GRAPH_WIDTH = 32;

const getFreeLane = (activeLanes: Map<string, number>): number => {
  const used = new Set(activeLanes.values());
  let lane = 0;

  while (used.has(lane)) {
    lane += 1;
  }

  return lane;
};

const getBranchName = (commit: CommitNode, lane: number): string =>
  commit.currentBranchName ??
  commit.branches?.[0] ??
  (lane === 0 ? 'main' : `lane-${lane + 1}`);

const getLaneColor = (lane: number, branchName: string): string =>
  lane === 0 ? 'var(--color-graph-lane-1)' : laneColor(branchName);

const rowCenterY = (rowIndex: number): number =>
  rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2;

export const computeLayout = (commits: CommitNode[]): GraphLayout => {
  const ordered = [...commits];
  const rowByHash = new Map(
    ordered.map((commit, rowIndex) => [commit.hash, rowIndex])
  );
  const commitByHash = new Map(
    ordered.map((commit) => [commit.hash, commit])
  );

  const activeHashes = new Set<string>();
  let cursorHash = ordered.find((commit) => commit.isCurrentBranch)?.hash;

  while (cursorHash && !activeHashes.has(cursorHash)) {
    activeHashes.add(cursorHash);
    cursorHash = commitByHash
      .get(cursorHash)
      ?.parents.find((parentHash) => commitByHash.has(parentHash));
  }

  const activeLanes = new Map<string, number>();
  const branchNameByLane = new Map<number, string>();
  const rows: GraphRow[] = [];
  const continuousLines: GraphLine[] = [];
  const parentEdges: GraphLine[] = [];
  let maxLane = -1;

  ordered.forEach((commit, rowIndex) => {
    let lane = activeLanes.get(commit.hash);

    if (lane === undefined) {
      lane = getFreeLane(activeLanes);
      activeLanes.set(commit.hash, lane);
    }

    const branchName = getBranchName(commit, lane);
    if (!branchNameByLane.has(lane) || commit.isCurrentBranch) {
      branchNameByLane.set(lane, branchName);
    }

    const parentHashes = [...new Set(commit.parents)].filter((hash) =>
      rowByHash.has(hash)
    );

    const parents: GraphParent[] = [];

    parentHashes.forEach((parentHash, parentIndex) => {
      let parentLane = activeLanes.get(parentHash);

      if (parentLane === undefined) {
        parentLane = parentIndex === 0 ? lane : getFreeLane(activeLanes);
        activeLanes.set(parentHash, parentLane);
      }

      const parentRowIndex = rowByHash.get(parentHash);
      if (parentRowIndex === undefined) {
        return;
      }

      const parentBranchName =
        branchNameByLane.get(parentLane) ?? `lane-${parentLane + 1}`;
      const parentColor = getLaneColor(parentLane, parentBranchName);

      parents.push({
        hash: parentHash,
        lane: parentLane,
        rowIndex: parentRowIndex,
        active: activeHashes.has(commit.hash) && activeHashes.has(parentHash),
        color: parentColor
      });

      maxLane = Math.max(maxLane, parentLane);

      parentEdges.push({
        fromLane: lane,
        toLane: parentLane,
        fromY: rowCenterY(rowIndex),
        toY: rowCenterY(parentRowIndex),
        color: parentColor
      });
    });

    if (parentHashes.length === 0) {
      activeLanes.delete(commit.hash);
    } else {
      const firstParentHash = parentHashes[0];
      if (
        firstParentHash !== undefined &&
        activeLanes.get(firstParentHash) !== lane
      ) {
        activeLanes.delete(commit.hash);
      }
    }

    maxLane = Math.max(maxLane, lane);

    rows.push({
      commit: { ...commit, lane },
      lane,
      active: activeHashes.has(commit.hash),
      parents
    });
  });

  const graphLanes: GraphLane[] = Array.from(
    { length: maxLane + 1 },
    (_, index) => {
      const branchName = branchNameByLane.get(index) ?? `lane-${index + 1}`;
      return {
        index,
        branchName,
        color: getLaneColor(index, branchName)
      };
    }
  );

  const rowsWithColors = rows.map((row) => ({
    ...row,
    commit: {
      ...row.commit,
      color:
        graphLanes[row.lane]?.color ??
        getLaneColor(row.lane, getBranchName(row.commit, row.lane))
    }
  }));

  for (let laneIndex = 0; laneIndex < graphLanes.length; laneIndex += 1) {
    const lane = graphLanes[laneIndex];
    if (!lane) {
      continue;
    }

    const laneRows = rowsWithColors
      .map((row, rowIndex) => ({ row, rowIndex }))
      .filter(({ row }) => row.lane === laneIndex);

    for (let i = 0; i < laneRows.length - 1; i += 1) {
      const current = laneRows[i];
      const next = laneRows[i + 1];
      if (!current || !next) {
        continue;
      }

      continuousLines.push({
        fromLane: laneIndex,
        toLane: laneIndex,
        fromY: rowCenterY(current.rowIndex),
        toY: rowCenterY(next.rowIndex),
        color: lane.color
      });
    }
  }

  return {
    rows: rowsWithColors,
    lanes: graphLanes,
    maxLane,
    continuousLines,
    parentEdges,
    width: GRAPH_WIDTH + maxLane * LANE_WIDTH,
    height: rowsWithColors.length * ROW_HEIGHT
  };
};
