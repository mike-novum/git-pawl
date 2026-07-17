import type { FC } from 'react';

import type { Branch, BranchUpstream } from '../model/types';

export type BranchBadgeProps = {
  name: string;
  current?: boolean;
  upstream?: BranchUpstream;
  className?: string;
};

export type BranchSwitcherProps = {
  branches: Branch[];
  current: string | null;
  onSelect?: (branchName: string) => void;
  className?: string;
};

export type FC_BranchBadge = FC<BranchBadgeProps>;
export type FC_BranchSwitcher = FC<BranchSwitcherProps>;
