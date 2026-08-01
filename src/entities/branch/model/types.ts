export type BranchUpstream = {
  ref: string;
  ahead: number;
  behind: number;
};

export type Branch = {
  name: string;
  target: string;
  current: boolean;
  commits: string[];
  upstream?: BranchUpstream;
};

export type BranchMainline = {
  name: string;
  commits: string[];
};

export type CurrentBranchInfo = {
  name: string | null;
  detached: boolean;
};
