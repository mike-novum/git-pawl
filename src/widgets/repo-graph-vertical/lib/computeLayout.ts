import type {
  CommitNode,
  GraphLane,
  GraphLayout,
  GraphLine,
  GraphParent,
  GraphRow
} from '../types';
import type { BranchMainline } from '@/entities/branch';
import { laneColor } from './laneColor';

export type ComputeLayoutOptions = {
  branchMainlines?: BranchMainline[];
  currentBranchName?: string | null;
};

export const ROW_HEIGHT = 32;
export const LANE_WIDTH = 14;
export const GRAPH_WIDTH = 32;

const PRIMARY_BRANCH_NAME = 'main';

const rowCenterY = (rowIndex: number): number =>
  rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2;

const buildMainlineMaps = (
  branchMainlines: BranchMainline[]
): {
  branchMainlineByBranch: Map<string, string[]>;
  commitToBranches: Map<string, string[]>;
  branchTips: Map<string, string>;
} => {
  const branchMainlineByBranch = new Map<string, string[]>();
  const commitToBranches = new Map<string, string[]>();
  const branchTips = new Map<string, string>();

  for (const entry of branchMainlines) {
    const commits: string[] = entry.commits.filter(
      (hash: string) => typeof hash === 'string' && hash.length > 0
    );
    branchMainlineByBranch.set(entry.name, commits);
    const tip = commits[0];
    if (tip) {
      branchTips.set(entry.name, tip);
    }
    for (const hash of commits) {
      const list = commitToBranches.get(hash) ?? [];
      if (!list.includes(entry.name)) {
        list.push(entry.name);
      }
      commitToBranches.set(hash, list);
    }
  }

  return { branchMainlineByBranch, commitToBranches, branchTips };
};

const findHeadBranch = (
  commits: CommitNode[],
  branchTips: Map<string, string>,
  currentBranchName: string | null
): string | null => {
  if (
    currentBranchName &&
    branchTips.has(currentBranchName)
  ) {
    return currentBranchName;
  }

  for (const commit of commits) {
    if (!commit.isCurrentBranch) {
      continue;
    }
    if (commit.currentBranchName) {
      return commit.currentBranchName;
    }
    if (commit.branches && commit.branches.length > 0) {
      return commit.branches[0] ?? null;
    }
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

const collectBranchOrder = (
  commits: CommitNode[],
  branchTips: Map<string, string>
): string[] => {
  const seen = new Set<string>();
  const ordered: string[] = [];

  for (const commit of commits) {
    if (!commit.branches) continue;
    for (const branch of commit.branches) {
      if (seen.has(branch)) continue;
      seen.add(branch);
      ordered.push(branch);
    }
  }

  for (const branch of branchTips.keys()) {
    if (seen.has(branch)) continue;
    seen.add(branch);
    ordered.push(branch);
  }

  return ordered;
};

const pickPrimaryBranch = (
  commit: CommitNode,
  mainlineBranches: string[],
  branchTips: Map<string, string>,
  branchMainlineByBranch: Map<string, string[]>,
  headBranch: string | null
): string | null => {
  for (const branch of mainlineBranches) {
    if (branchTips.get(branch) === commit.hash) {
      return branch;
    }
  }

  let bestBranch: string | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const branch of mainlineBranches) {
    const mainline = branchMainlineByBranch.get(branch);
    if (!mainline) continue;
    const idx = mainline.indexOf(commit.hash);
    if (idx >= 0 && idx < bestDistance) {
      bestDistance = idx;
      bestBranch = branch;
    }
  }

  if (bestBranch) {
    return bestBranch;
  }

  if (headBranch && mainlineBranches.includes(headBranch)) {
    return headBranch;
  }

  if (commit.branches && commit.branches.length > 0) {
    return commit.branches[0] ?? null;
  }

  return headBranch;
};

export const computeLayout = (
  commits: CommitNode[],
  options: ComputeLayoutOptions = {}
): GraphLayout => {
  const ordered = [...commits];
  const rowByHash = new Map(
    ordered.map((commit, rowIndex) => [commit.hash, rowIndex])
  );
  const commitByHash = new Map(
    ordered.map((commit) => [commit.hash, commit])
  );

  const branchMainlines = options.branchMainlines ?? [];
  const hasMainlines = branchMainlines.length > 0;

  const { branchMainlineByBranch, commitToBranches, branchTips } =
    buildMainlineMaps(branchMainlines);

  const headBranch = findHeadBranch(
    ordered,
    branchTips,
    options.currentBranchName ?? null
  );

  const branchOrder = collectBranchOrder(ordered, branchTips);
  const branchNameToLane = new Map<string, number>();
  const laneToBranchName = new Map<number, string>();

  const hasPrimary = branchOrder.includes(PRIMARY_BRANCH_NAME);
  if (hasPrimary) {
    branchNameToLane.set(PRIMARY_BRANCH_NAME, 0);
    laneToBranchName.set(0, PRIMARY_BRANCH_NAME);
  }

  let nextLane = hasPrimary ? 1 : 0;

  if (
    headBranch &&
    headBranch !== PRIMARY_BRANCH_NAME &&
    branchOrder.includes(headBranch)
  ) {
    branchNameToLane.set(headBranch, nextLane);
    laneToBranchName.set(nextLane, headBranch);
    nextLane += 1;
  }

  for (const branch of branchOrder) {
    if (branchNameToLane.has(branch)) continue;
    branchNameToLane.set(branch, nextLane);
    laneToBranchName.set(nextLane, branch);
    nextLane += 1;
  }

  if (!hasPrimary && laneToBranchName.get(0) === undefined) {
    laneToBranchName.set(0, PRIMARY_BRANCH_NAME);
  }

  const activeHashes = new Set<string>();
  let cursorHash = ordered.find((commit) => commit.isCurrentBranch)?.hash;

  while (cursorHash && !activeHashes.has(cursorHash)) {
    activeHashes.add(cursorHash);
    cursorHash = commitByHash
      .get(cursorHash)
      ?.parents.find((parentHash) => commitByHash.has(parentHash));
  }

  const childIndicesByHash = new Map<string, number[]>();
  ordered.forEach((commit, index) => {
    for (const parent of commit.parents) {
      if (!rowByHash.has(parent)) continue;
      const list = childIndicesByHash.get(parent) ?? [];
      list.push(index);
      childIndicesByHash.set(parent, list);
    }
  });

  const laneByHash = new Map<string, number>();
  const primaryBranchByHash = new Map<string, string | null>();
  const sideCommitLaneByHash = new Map<string, number>();
  const rows: GraphRow[] = [];
  const continuousLines: GraphLine[] = [];
  const parentEdges: GraphLine[] = [];

  let maxLane = Math.max(0, ...Array.from(laneToBranchName.keys()));

  const resolveMainlineBranches = (commit: CommitNode): string[] => {
    if (hasMainlines) {
      return commitToBranches.get(commit.hash) ?? [];
    }
    return commit.branches ?? [];
  };

  const resolveLaneForBranch = (branch: string | null): number => {
    if (branch && branchNameToLane.has(branch)) {
      return branchNameToLane.get(branch) ?? 0;
    }
    if (branch) {
      branchNameToLane.set(branch, nextLane);
      laneToBranchName.set(nextLane, branch);
      nextLane += 1;
      return branchNameToLane.get(branch) ?? 0;
    }
    return 0;
  };

  ordered.forEach((commit, rowIndex) => {
    const mainlineBranches = resolveMainlineBranches(commit);
    const onMainline =
      !hasMainlines || (mainlineBranches && mainlineBranches.length > 0);

    let primaryBranch: string | null = null;
    let lane: number;

    if (onMainline) {
      primaryBranch = pickPrimaryBranch(
        commit,
        mainlineBranches,
        branchTips,
        branchMainlineByBranch,
        headBranch
      );
      lane = resolveLaneForBranch(primaryBranch);
    } else {
      const childIndices = childIndicesByHash.get(commit.hash) ?? [];
      let inherited: number | null = null;
      for (const childIdx of childIndices) {
        const childHash = ordered[childIdx]?.hash;
        if (!childHash) continue;
        if (sideCommitLaneByHash.has(childHash)) {
          inherited = sideCommitLaneByHash.get(childHash) ?? null;
          break;
        }
      }
      lane = inherited ?? nextLane;
      if (inherited === null) {
        laneToBranchName.set(lane, `side-${lane}`);
        nextLane += 1;
      }
      sideCommitLaneByHash.set(commit.hash, lane);
    }

    laneByHash.set(commit.hash, lane);
    primaryBranchByHash.set(commit.hash, primaryBranch);

    const parentHashes = [...new Set(commit.parents)].filter((hash) =>
      rowByHash.has(hash)
    );

    const parents: GraphParent[] = [];

    parentHashes.forEach((parentHash) => {
      const parentCommit = commitByHash.get(parentHash);
      if (!parentCommit) {
        return;
      }

      const parentMainlineBranches = resolveMainlineBranches(parentCommit);
      const parentOnMainline =
        !hasMainlines ||
        (parentMainlineBranches && parentMainlineBranches.length > 0);

      let parentLane: number;

      if (parentOnMainline) {
        if (laneByHash.has(parentHash)) {
          parentLane = laneByHash.get(parentHash) ?? 0;
        } else {
          const parentPrimary =
            pickPrimaryBranch(
              parentCommit,
              parentMainlineBranches,
              branchTips,
              branchMainlineByBranch,
              headBranch
            ) ?? headBranch;

          parentLane = resolveLaneForBranch(parentPrimary);
          primaryBranchByHash.set(parentHash, parentPrimary);
        }
      } else {
        parentLane = sideCommitLaneByHash.get(parentHash) ?? nextLane;
        if (!sideCommitLaneByHash.has(parentHash)) {
          sideCommitLaneByHash.set(parentHash, parentLane);
          laneToBranchName.set(parentLane, `side-${parentLane}`);
          nextLane += 1;
        }
      }

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
    branchTips,
    width: GRAPH_WIDTH + maxLane * LANE_WIDTH,
    height: rowsWithColors.length * ROW_HEIGHT
  };
};