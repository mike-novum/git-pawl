const normalizeBranchName = (branchName: string): string =>
  branchName.replace(/^refs\/heads\//, '').replace(/^origin\//, '');

const hashBranchName = (branchName: string): number => {
  let hash = 0;

  for (const character of branchName) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return hash;
};

export const laneColor = (branchName: string): string => {
  const normalizedName = normalizeBranchName(branchName);
  const laneIndex =
    normalizedName === 'main' || normalizedName === 'master'
      ? 1
      : normalizedName === 'develop'
        ? 2
        : (hashBranchName(normalizedName) % 8) + 1;

  return `var(--color-graph-lane-${laneIndex})`;
};
