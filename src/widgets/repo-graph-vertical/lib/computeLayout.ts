import type {
  CommitNode,
  GraphLane,
  GraphLayout,
  GraphParent,
  GraphRow
} from '../types';
import { laneColor } from './laneColor';

export const ROW_HEIGHT = 32;
export const LANE_WIDTH = 14;
export const GRAPH_WIDTH = 32;

const getFreeLane = (lanes: (string | null)[]): number => {
  const freeLane = lanes.findIndex((hash) => hash === null);

  return freeLane === -1 ? lanes.length : freeLane;
};

const getBranchName = (commit: CommitNode, lane: number): string =>
  commit.currentBranchName ??
  commit.branches?.[0] ??
  (lane === 0 ? 'main' : `lane-${lane + 1}`);

const getLaneColor = (lane: number, branchName: string): string =>
  lane === 0 ? 'var(--color-graph-lane-1)' : laneColor(branchName);

export const computeLayout = (commits: CommitNode[]): GraphLayout => {
  const ordered = [...commits];
  const rowByHash = new Map(
    ordered.map((commit, rowIndex) => [commit.hash, rowIndex])
  );
  const commitByHash = new Map(
    ordered.map((commit) => [commit.hash, commit])
  );
  const activeHashes = new Set<string>();
  let activeHash = ordered.find((commit) => commit.isCurrentBranch)?.hash;

  while (activeHash && !activeHashes.has(activeHash)) {
    activeHashes.add(activeHash);
    activeHash = commitByHash
      .get(activeHash)
      ?.parents.find((parentHash) => commitByHash.has(parentHash));
  }

  const lanes: (string | null)[] = [];
  const branchNameByLane = new Map<number, string>();
  const rows: GraphRow[] = [];
  let maxLane = 0;

  ordered.forEach((commit) => {
    let lane = lanes.indexOf(commit.hash);

    if (lane === -1) {
      lane = getFreeLane(lanes);
      lanes[lane] = commit.hash;
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
      let parentLane = lanes.indexOf(parentHash);

      if (parentLane === -1) {
        parentLane = parentIndex === 0 ? lane : getFreeLane(lanes);
        lanes[parentLane] = parentHash;
      }

      if (parentIndex === 0 && parentLane !== lane) {
        lanes[lane] = null;
      }

      const rowIndex = rowByHash.get(parentHash);

      if (rowIndex !== undefined) {
        const parentBranchName =
          branchNameByLane.get(parentLane) ?? `lane-${parentLane + 1}`;
        parents.push({
          hash: parentHash,
          lane: parentLane,
          rowIndex,
          active:
            activeHashes.has(commit.hash) && activeHashes.has(parentHash),
          color: getLaneColor(parentLane, parentBranchName)
        });
      }

      maxLane = Math.max(maxLane, parentLane);
    });

    if (parentHashes.length === 0) {
      lanes[lane] = null;
    }

    maxLane = Math.max(maxLane, lane);
    rows.push({
      commit: { ...commit, lane },
      lane,
      active: activeHashes.has(commit.hash),
      parents,
      verticalLines: []
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
      color: graphLanes[row.lane]?.color ?? getLaneColor(row.lane, getBranchName(row.commit, row.lane))
    }
  }));

  graphLanes.forEach((lane) => {
    const laneRows = rowsWithColors
      .map((row, rowIndex) => ({ row, rowIndex }))
      .filter(({ row }) => row.lane === lane.index);

    laneRows.forEach(({ rowIndex }, index) => {
      const next = laneRows[index + 1];
      if (!next) {
        return;
      }

      rowsWithColors[rowIndex]?.verticalLines.push({
        fromLane: lane.index,
        toLane: lane.index,
        rowDistance: next.rowIndex - rowIndex,
        color: lane.color,
        direction: 'outgoing'
      });
      rowsWithColors[next.rowIndex]?.verticalLines.push({
        fromLane: lane.index,
        toLane: lane.index,
        rowDistance: next.rowIndex - rowIndex,
        color: lane.color,
        direction: 'incoming'
      });
    });
  });

  rowsWithColors.forEach((row, rowIndex) => {
    row.parents.forEach((parent) => {
      row.verticalLines.push({
        fromLane: row.lane,
        toLane: parent.lane,
        rowDistance: parent.rowIndex - rowIndex,
        color: parent.color,
        direction: 'outgoing'
      });
      const parentRow = rowsWithColors[parent.rowIndex];
      parentRow?.verticalLines.push({
        fromLane: row.lane,
        toLane: parent.lane,
        rowDistance: parent.rowIndex - rowIndex,
        color: parent.color,
        direction: 'incoming'
      });
    });
  });

  return {
    rows: rowsWithColors,
    lanes: graphLanes,
    maxLane,
    width: GRAPH_WIDTH + maxLane * LANE_WIDTH,
    height: rows.length * ROW_HEIGHT
  };
};
