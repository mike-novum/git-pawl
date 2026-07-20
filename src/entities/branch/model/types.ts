export type BranchUpstream = {
  ref: string;
  ahead: number;
  behind: number;
};

export type Branch = {
  name: string;
  target: string;
  current: boolean;
  upstream?: BranchUpstream;
};

export type CurrentBranchInfo = {
  name: string | null;
  detached: boolean;
};
