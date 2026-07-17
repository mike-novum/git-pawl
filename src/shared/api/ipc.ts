import type {
  ApiSchema,
  AppInfo,
  GitStatusArgs,
  GitLogArgs,
  GitDiffArgs,
  GitRevParseArgs,
  GitCloneArgs,
  GitFetchArgs,
  GitPullArgs,
  GitPushArgs,
  GitCommitArgs,
  GitStashArgs,
  GitMergeArgs,
  GitRebaseArgs,
  GitResetArgs,
  GitRevertArgs,
  GitAmendArgs,
  GitCheckoutArgs,
  GitBranchArgs,
  GitTagArgs,
  GitPatchArgs,
  GitConfigArgs,
  GitHooksArgs,
  FsSizeArgs,
  FsIconArgs,
  FsWorkspaceCreateArgs,
  StoreGetArgs,
  StoreSetArgs,
  StoreDeleteArgs
} from '@electron/preload';

export type { ApiSchema, AppInfo } from '@electron/preload';

declare global {
  interface Window {
    api: ApiSchema;
  }
}

const FALLBACK_INFO: AppInfo = {
  name: 'git-pawl',
  version: '0.1.0',
  electron: 'dev',
  node: 'dev'
};

const getBridge = (): ApiSchema | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  if (!('api' in window)) {
    return null;
  }
  return window.api;
};

const safeInvoke = async <T>(
  invoke: (bridge: ApiSchema) => Promise<T>,
  fallback: T
): Promise<T> => {
  const bridge = getBridge();
  if (!bridge) {
    return fallback;
  }
  return invoke(bridge);
};

export const getAppInfo = async (): Promise<AppInfo> =>
  safeInvoke<AppInfo>((bridge) => bridge.getAppInfo(), FALLBACK_INFO);

export const storeGet = async <T>(args: StoreGetArgs): Promise<T | undefined> =>
  safeInvoke<T | undefined>(
    (bridge) => bridge.storeGet(args) as Promise<T | undefined>,
    undefined
  );

export const storeSet = async (args: StoreSetArgs): Promise<void> =>
  safeInvoke<void>((bridge) => bridge.storeSet(args), undefined);

export const storeDelete = async (args: StoreDeleteArgs): Promise<void> =>
  safeInvoke<void>((bridge) => bridge.storeDelete(args), undefined);

export const gitStatus = async (args: GitStatusArgs): Promise<unknown> =>
  safeInvoke<unknown>((bridge) => bridge.gitStatus(args), null);

export const gitLog = async (args: GitLogArgs): Promise<unknown> =>
  safeInvoke<unknown>((bridge) => bridge.gitLog(args), []);

export const gitDiff = async (args: GitDiffArgs): Promise<unknown> =>
  safeInvoke<unknown>((bridge) => bridge.gitDiff(args), '');

export const gitRevParse = async (args: GitRevParseArgs): Promise<unknown> =>
  safeInvoke<unknown>((bridge) => bridge.gitRevParse(args), null);

export const gitClone = async (args: GitCloneArgs): Promise<unknown> =>
  safeInvoke<unknown>((bridge) => bridge.gitClone(args), null);

export const gitFetch = async (args: GitFetchArgs): Promise<unknown> =>
  safeInvoke<unknown>((bridge) => bridge.gitFetch(args), null);

export const gitPull = async (args: GitPullArgs): Promise<unknown> =>
  safeInvoke<unknown>((bridge) => bridge.gitPull(args), null);

export const gitPush = async (args: GitPushArgs): Promise<unknown> =>
  safeInvoke<unknown>((bridge) => bridge.gitPush(args), null);

export const gitCommit = async (args: GitCommitArgs): Promise<unknown> =>
  safeInvoke<unknown>((bridge) => bridge.gitCommit(args), null);

export const gitStash = async (args: GitStashArgs): Promise<unknown> =>
  safeInvoke<unknown>((bridge) => bridge.gitStash(args), null);

export const gitMerge = async (args: GitMergeArgs): Promise<unknown> =>
  safeInvoke<unknown>((bridge) => bridge.gitMerge(args), null);

export const gitRebase = async (args: GitRebaseArgs): Promise<unknown> =>
  safeInvoke<unknown>((bridge) => bridge.gitRebase(args), null);

export const gitReset = async (args: GitResetArgs): Promise<unknown> =>
  safeInvoke<unknown>((bridge) => bridge.gitReset(args), null);

export const gitRevert = async (args: GitRevertArgs): Promise<unknown> =>
  safeInvoke<unknown>((bridge) => bridge.gitRevert(args), null);

export const gitAmend = async (args: GitAmendArgs): Promise<unknown> =>
  safeInvoke<unknown>((bridge) => bridge.gitAmend(args), null);

export const gitCheckout = async (args: GitCheckoutArgs): Promise<unknown> =>
  safeInvoke<unknown>((bridge) => bridge.gitCheckout(args), null);

export const gitBranch = async (args: GitBranchArgs): Promise<unknown> =>
  safeInvoke<unknown>((bridge) => bridge.gitBranch(args), null);

export const gitTag = async (args: GitTagArgs): Promise<unknown> =>
  safeInvoke<unknown>((bridge) => bridge.gitTag(args), null);

export const gitPatch = async (args: GitPatchArgs): Promise<unknown> =>
  safeInvoke<unknown>((bridge) => bridge.gitPatch(args), null);

export const gitConfig = async (args: GitConfigArgs): Promise<unknown> =>
  safeInvoke<unknown>((bridge) => bridge.gitConfig(args), null);

export const gitHooks = async (args: GitHooksArgs): Promise<unknown> =>
  safeInvoke<unknown>((bridge) => bridge.gitHooks(args), []);

export const fsSelectDirectory = async (): Promise<string | null> =>
  safeInvoke<string | null>((bridge) => bridge.fsSelectDirectory(), null);

export const fsSize = async (args: FsSizeArgs): Promise<unknown> =>
  safeInvoke<unknown>((bridge) => bridge.fsSize(args), 0);

export const fsIcon = async (args: FsIconArgs): Promise<void> =>
  safeInvoke<void>((bridge) => bridge.fsIcon(args), undefined);

export const fsWorkspaceList = async (): Promise<unknown> =>
  safeInvoke<unknown>((bridge) => bridge.fsWorkspaceList(), []);

export const fsWorkspaceCreate = async (
  args: FsWorkspaceCreateArgs
): Promise<unknown> =>
  safeInvoke<unknown>((bridge) => bridge.fsWorkspaceCreate(args), null);

export const api = {
  getAppInfo,
  storeGet,
  storeSet,
  storeDelete,
  gitStatus,
  gitLog,
  gitDiff,
  gitRevParse,
  gitClone,
  gitFetch,
  gitPull,
  gitPush,
  gitCommit,
  gitStash,
  gitMerge,
  gitRebase,
  gitReset,
  gitRevert,
  gitAmend,
  gitCheckout,
  gitBranch,
  gitTag,
  gitPatch,
  gitConfig,
  gitHooks,
  fsSelectDirectory,
  fsSize,
  fsIcon,
  fsWorkspaceList,
  fsWorkspaceCreate
};

export type IpcApi = typeof api;
