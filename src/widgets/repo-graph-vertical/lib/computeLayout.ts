import type { CommitNode, GraphLayout, GraphParent } from '../types';

export const ROW_HEIGHT = 44;
export const LANE_WIDTH = 14;
export const GRAPH_WIDTH = 32;

const getFreeLane = (lanes: (string | null)[]): number => {
  const freeLane = lanes.findIndex((hash) => hash === null);

  return freeLane === -1 ? lanes.length : freeLane;
};

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
  const rows: GraphLayout['rows'] = [];
  let maxLane = 0;

  ordered.forEach((commit) => {
    let lane = lanes.indexOf(commit.hash);

    if (lane === -1) {
      lane = getFreeLane(lanes);
      lanes[lane] = commit.hash;
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
        parents.push({
          hash: parentHash,
          lane: parentLane,
          rowIndex,
          active:
            activeHashes.has(commit.hash) && activeHashes.has(parentHash)
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
      parents
    });
  });

  return {
    rows,
    maxLane,
    width: GRAPH_WIDTH + maxLane * LANE_WIDTH,
    height: rows.length * ROW_HEIGHT
  };
};
