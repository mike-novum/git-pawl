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

const findLaneIndex = (
  lanes: (string | null)[],
  hash: string
): number => {
  for (let i = 0; i < lanes.length; i += 1) {
    if (lanes[i] === hash) {
      return i;
    }
  }
  return -1;
};

const findFreeLaneIndex = (lanes: (string | null)[]): number => {
  for (let i = 0; i < lanes.length; i += 1) {
    if (lanes[i] === null) {
      return i;
    }
  }
  return -1;
};

const computeActiveHashes = (commits: CommitNode[]): Set<string> => {
  const commitByHash = new Map(commits.map((c) => [c.hash, c]));
  const visited = new Set<string>();
  const ordered = [...commits];
  let cursor = ordered.find((commit) => commit.isCurrentBranch)?.hash;

  while (cursor && !visited.has(cursor)) {
    visited.add(cursor);
    const commit = commitByHash.get(cursor);
    if (!commit) break;
    cursor = commit.parents.find(
      (parentHash) => commitByHash.has(parentHash)
    );
  }

  return visited;
};

const buildChildrenMap = (
  commits: CommitNode[],
  visibleSet: Set<string>
): Map<string, string[]> => {
  const map = new Map<string, string[]>();
  for (const commit of commits) {
    for (const parentHash of commit.parents) {
      if (!visibleSet.has(parentHash)) continue;
      const list = map.get(parentHash) ?? [];
      if (!list.includes(commit.hash)) {
        list.push(commit.hash);
      }
      map.set(parentHash, list);
    }
  }
  return map;
};

export const computeLayout = (
  commits: CommitNode[]
): GraphLayout => {
  const ordered = [...commits];
  const rowByHash = new Map(
    ordered.map((commit, rowIndex) => [commit.hash, rowIndex])
  );
  const commitByHash = new Map(ordered.map((c) => [c.hash, c]));
  const visibleSet = new Set(ordered.map((c) => c.hash));
  const activeHashes = computeActiveHashes(ordered);
  const childrenByHash = buildChildrenMap(ordered, visibleSet);

  const lanes: (string | null)[] = [];
  const laneByHash = new Map<string, number>();
  const processed = new Set<string>();
  const parentEdges: GraphLine[] = [];

  for (let rowIndex = 0; rowIndex < ordered.length; rowIndex += 1) {
    const commit = ordered[rowIndex];
    if (!commit) {
      continue;
    }

    let cLane = findLaneIndex(lanes, commit.hash);

    if (cLane === -1) {
      for (const parentHash of commit.parents) {
        if (!processed.has(parentHash)) continue;
        const siblings = childrenByHash.get(parentHash) ?? [];
        const hasOtherProcessedChild = siblings.some(
          (siblingHash) =>
            siblingHash !== commit.hash && processed.has(siblingHash)
        );
        if (!hasOtherProcessedChild) {
          const parentLane = laneByHash.get(parentHash);
          if (parentLane !== undefined) {
            cLane = parentLane;
            break;
          }
        }
      }
    }

    if (cLane === -1) {
      cLane = findFreeLaneIndex(lanes);
      if (cLane === -1) {
        cLane = lanes.length;
        lanes.push(null);
      }
    }

    laneByHash.set(commit.hash, cLane);
    processed.add(commit.hash);
    lanes[cLane] = commit.hash;

    const visibleParents = commit.parents.filter((hash) =>
      visibleSet.has(hash)
    );

    visibleParents.forEach((parentHash, parentIdx) => {
      let pLane = findLaneIndex(lanes, parentHash);
      if (pLane === -1) {
        if (parentIdx === 0) {
          pLane = cLane;
        } else {
          pLane = findFreeLaneIndex(lanes);
          if (pLane === -1) {
            pLane = lanes.length;
            lanes.push(null);
          }
        }
      }
      laneByHash.set(parentHash, pLane);
      lanes[pLane] = parentHash;

      if (cLane !== pLane) {
        const parentRow = rowByHash.get(parentHash);
        if (parentRow === undefined) {
          return;
        }
        parentEdges.push({
          fromLane: cLane,
          toLane: pLane,
          fromY: rowCenterY(rowIndex),
          toY: rowCenterY(parentRow),
          color: laneColor(pLane)
        });
      }
    });
  }

  const maxLane = Math.max(0, lanes.length - 1);

  const branchTips = new Map<string, string>();
  for (const commit of ordered) {
    if (!commit.branches) continue;
    for (const branch of commit.branches) {
      if (!branchTips.has(branch)) {
        branchTips.set(branch, commit.hash);
      }
    }
  }

  const graphLanes: GraphLane[] = Array.from(
    { length: maxLane + 1 },
    (_, index) => {
      const commitHash = lanes[index] ?? null;
      const commit = commitHash ? commitByHash.get(commitHash) : null;
      const branchName = commit?.branches?.[0] ?? `lane-${index + 1}`;
      return {
        index,
        branchName,
        color: laneColor(index)
      };
    }
  );

  const rows: GraphRow[] = ordered.map((commit) => {
    const lane = laneByHash.get(commit.hash) ?? 0;
    const parents: GraphParent[] = commit.parents
      .filter((hash) => visibleSet.has(hash))
      .map((parentHash) => {
        const parentLane = laneByHash.get(parentHash) ?? 0;
        const parentRowIndex = rowByHash.get(parentHash) ?? 0;
        return {
          hash: parentHash,
          lane: parentLane,
          rowIndex: parentRowIndex,
          active:
            activeHashes.has(commit.hash) &&
            activeHashes.has(parentHash),
          color: laneColor(parentLane)
        };
      });

    return {
      commit: { ...commit, lane, color: laneColor(lane) },
      lane,
      active: activeHashes.has(commit.hash),
      parents
    };
  });

  const continuousLines: GraphLine[] = [];
  for (let laneIndex = 0; laneIndex <= maxLane; laneIndex += 1) {
    const laneRows: number[] = [];
    rows.forEach((row, rowIndex) => {
      if (row.lane === laneIndex) {
        laneRows.push(rowIndex);
      }
    });

    for (let i = 0; i < laneRows.length - 1; i += 1) {
      const from = laneRows[i];
      const to = laneRows[i + 1];
      if (from === undefined || to === undefined) {
        continue;
      }
      continuousLines.push({
        fromLane: laneIndex,
        toLane: laneIndex,
        fromY: rowCenterY(from),
        toY: rowCenterY(to),
        color: laneColor(laneIndex)
      });
    }
  }

  return {
    rows,
    lanes: graphLanes,
    maxLane,
    continuousLines,
    parentEdges,
    branchTips,
    width: GRAPH_WIDTH + maxLane * LANE_WIDTH,
    height: rows.length * ROW_HEIGHT
  };
};