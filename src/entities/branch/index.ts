export {
  useBranches,
  useBranchMainlines,
  useCurrentBranch,
  useCheckoutBranch
} from './model';
export type {
  CheckoutBranchInput,
  CheckoutBranchResult,
  UseCheckoutBranchResult
} from './model';
export {
  branchListQueryKey,
  branchMainlineQueryKey,
  currentBranchQueryKey,
  fetchBranchList,
  fetchBranchCurrent,
  fetchBranchMainlinesList
} from './model';
export type {
  Branch,
  BranchMainline,
  BranchUpstream,
  CurrentBranchInfo
} from './model';

export {
  listBranches,
  buildBranches,
  fetchBranches,
  fetchCurrentBranch,
  fetchBranchMainlines
} from './api';

export { BranchBadge, BranchSwitcher } from './ui';
export type { BranchBadgeProps, BranchSwitcherProps } from './ui';
