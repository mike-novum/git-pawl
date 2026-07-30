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

const rowCenterY = (rowIndex: number): number =>
  rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2;

const findHeadBranch = (commits: CommitNode[]): string | null => {
  for (const commit of commits) {
    if (!commit.isCurrentBranch) {
      continue;
    }
    return commit.currentBranchName ?? commit.branches?.[0] ?? null;
  }

  const first = commits[0];
  if (first?.currentBranchName) {
    return first.currentBranchName;
  }

  if (first?.branches && first.branches.length > 0) {
    return first.branches[0] ?? null;
  }

  return null;
};

const buildBranchLaneMap = (
  commits: CommitNode[],
  headBranch: string | null
): {
  branchNameToLane: Map<string, number>;
  laneToBranchName: Map<number, string>;
} => {
  const branchNameToLane = new Map<string, number>();
  const laneToBranchName = new Map<number, string>();

  if (headBranch) {
    branchNameToLane.set(headBranch, 0);
    laneToBranchName.set(0, headBranch);
  } else {
    laneToBranchName.set(0, 'main');
  }

  let nextLane = 1;

  for (const commit of commits) {
    if (!commit.branches) {
      continue;
    }

    for (const branch of commit.branches) {
      if (branch === headBranch) {
        continue;
      }
      if (branchNameToLane.has(branch)) {
        continue;
      }
      branchNameToLane.set(branch, nextLane);
      laneToBranchName.set(nextLane, branch);
      nextLane += 1;
    }
  }

  return { branchNameToLane, laneToBranchName };
};

const resolveCommitLane = (
  commit: CommitNode,
  headBranch: string | null,
  branchNameToLane: Map<string, number>
): number => {
  const branches = commit.branches;

  if (branches && branches.length > 0) {
    if (headBranch && branches.includes(headBranch)) {
      return 0;
    }
    const firstLane = branchNameToLane.get(branches[0] ?? '');
    if (firstLane !== undefined) {
      return firstLane;
    }
  }

  return 0;
};

export const computeLayout = (commits: CommitNode[]): GraphLayout => {
  const ordered = [...commits];
  const rowByHash = new Map(
    ordered.map((commit, rowIndex) => [commit.hash, rowIndex])
  );
  const commitByHash = new Map(
    ordered.map((commit) => [commit.hash, commit])
  );

  const headBranch = findHeadBranch(ordered);
  const { branchNameToLane, laneToBranchName } = buildBranchLaneMap(
    ordered,
    headBranch
  );

  const activeHashes = new Set<string>();
  let cursorHash = ordered.find((commit) => commit.isCurrentBranch)?.hash;

  while (cursorHash && !activeHashes.has(cursorHash)) {
    activeHashes.add(cursorHash);
    cursorHash = commitByHash
      .get(cursorHash)
      ?.parents.find((parentHash) => commitByHash.has(parentHash));
  }

  const laneByHash = new Map<string, number>();
  const rows: GraphRow[] = [];
  const continuousLines: GraphLine[] = [];
  const parentEdges: GraphLine[] = [];

  let maxLane = Math.max(0, ...Array.from(laneToBranchName.keys()));

  ordered.forEach((commit, rowIndex) => {
    const lane = resolveCommitLane(commit, headBranch, branchNameToLane);
    laneByHash.set(commit.hash, lane);

    const parentHashes = [...new Set(commit.parents)].filter((hash) =>
      rowByHash.has(hash)
    );

    const parents: GraphParent[] = [];

    parentHashes.forEach((parentHash) => {
      const parentCommit = commitByHash.get(parentHash);
      if (!parentCommit) {
        return;
      }

      const parentLane = laneByHash.has(parentHash)
        ? (laneByHash.get(parentHash) as number)
        : resolveCommitLane(parentCommit, headBranch, branchNameToLane);

      laneByHash.set(parentHash, parentLane);

      const parentRowIndex = rowByHash.get(parentHash);
      if (parentRowIndex === undefined) {
        return;
      }

      const parentColor = laneColor(parentLane);

      parents.push({
        hash: parentHash,
        lane: parentLane,
        rowIndex: parentRowIndex,
        active: activeHashes.has(commit.hash) && activeHashes.has(parentHash),
        color: parentColor
      });

      maxLane = Math.max(maxLane, parentLane);

      if (parentLane !== lane) {
        parentEdges.push({
          fromLane: lane,
          toLane: parentLane,
          fromY: rowCenterY(rowIndex),
          toY: rowCenterY(parentRowIndex),
          color: parentColor
        });
      }
    });

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
      const branchName = laneToBranchName.get(index) ?? `lane-${index + 1}`;
      return {
        index,
        branchName,
        color: laneColor(index)
      };
    }
  );

  const rowsWithColors = rows.map((row) => ({
    ...row,
    commit: { ...row.commit, color: graphLanes[row.lane]?.color ?? laneColor(row.lane) }
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