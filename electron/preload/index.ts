import { contextBridge, ipcRenderer } from 'electron';

import type { Commit as GitCommit, DiffHunk, GitStatus } from '../shared/types/git';

export type AppInfo = {
  name: string;
  version: string;
  electron: string;
  node: string;
};

export type Theme = 'dark' | 'light';

export type StoreGetArgs = { key: string };
export type StoreSetArgs = { key: string; value: unknown };
export type StoreDeleteArgs = { key: string };

export type GitStatusArgs = { repoPath: string };
export type GitLogArgs = { repoPath: string; maxCount?: number };
export type GitDiffArgs = { repoPath: string; range?: string };
export type GitRevParseArgs = { repoPath: string };
export type GitCloneArgs = { url: string; destPath: string };
export type GitFetchArgs = { repoPath: string; remote?: string };
export type GitPullArgs = { repoPath: string; remote?: string; branch?: string };
export type GitPushArgs = { repoPath: string; remote?: string; branch?: string };
export type GitCommitArgs = { repoPath: string; message: string; noVerify?: boolean };
export type GitStashArgs = { repoPath: string; action: 'push' | 'pop' | 'apply' | 'drop'; message?: string };
export type GitMergeArgs = { repoPath: string; branch: string };
export type GitRebaseArgs = { repoPath: string; branch: string };
export type GitResetArgs = { repoPath: string; mode: 'soft' | 'mixed' | 'hard'; target?: string };
export type GitRevertArgs = { repoPath: string; commit: string };
export type GitAmendArgs = { repoPath: string };
export type GitCheckoutArgs = { repoPath: string; target: string; create?: boolean };
export type GitBranchArgs = { repoPath: string; action: 'list' | 'create' | 'delete'; name?: string };
export type GitTagArgs = { repoPath: string; action: 'list' | 'create' | 'delete'; name?: string; target?: string };
export type GitPatchArgs = { repoPath: string; range: string };
export type GitConfigArgs = { repoPath: string; key: string; value?: string };
export type GitHooksArgs = { repoPath: string; list: true };

export type FsSizeArgs = { path: string };
export type FsIconArgs = { path: string };
export type FsWorkspaceListArgs = Record<string, never>;

export type ApiSchema = {
  getAppInfo: () => Promise<AppInfo>;

  storeGet: (args: StoreGetArgs) => Promise<unknown>;
  storeSet: (args: StoreSetArgs) => Promise<void>;
  storeDelete: (args: StoreDeleteArgs) => Promise<void>;

  gitStatus: (args: GitStatusArgs) => Promise<GitStatus>;
  gitLog: (args: GitLogArgs) => Promise<GitCommit[]>;
  gitDiff: (args: GitDiffArgs) => Promise<DiffHunk[]>;
  gitRevParse: (args: GitRevParseArgs) => Promise<string>;
  gitClone: (args: GitCloneArgs) => Promise<unknown>;
  gitFetch: (args: GitFetchArgs) => Promise<unknown>;
  gitPull: (args: GitPullArgs) => Promise<unknown>;
  gitPush: (args: GitPushArgs) => Promise<unknown>;
  gitCommit: (args: GitCommitArgs) => Promise<unknown>;
  gitStash: (args: GitStashArgs) => Promise<unknown>;
  gitMerge: (args: GitMergeArgs) => Promise<unknown>;
  gitRebase: (args: GitRebaseArgs) => Promise<unknown>;
  gitReset: (args: GitResetArgs) => Promise<unknown>;
  gitRevert: (args: GitRevertArgs) => Promise<unknown>;
  gitAmend: (args: GitAmendArgs) => Promise<unknown>;
  gitCheckout: (args: GitCheckoutArgs) => Promise<unknown>;
  gitBranch: (args: GitBranchArgs) => Promise<unknown>;
  gitTag: (args: GitTagArgs) => Promise<unknown>;
  gitPatch: (args: GitPatchArgs) => Promise<unknown>;
  gitConfig: (args: GitConfigArgs) => Promise<unknown>;
  gitHooks: (args: GitHooksArgs) => Promise<unknown>;

  fsSize: (args: FsSizeArgs) => Promise<unknown>;
  fsIcon: (args: FsIconArgs) => Promise<unknown>;
  fsWorkspaceList: (args: FsWorkspaceListArgs) => Promise<unknown>;

  authGithubStart: () => Promise<unknown>;
  authGithubComplete: (args: { code: string }) => Promise<unknown>;
  authGitlabStart: () => Promise<unknown>;
  authGitlabComplete: (args: { code: string }) => Promise<unknown>;
  accountList: () => Promise<unknown>;
  accountSetActive: (args: { id: string }) => Promise<unknown>;
  accountRemove: (args: { id: string }) => Promise<unknown>;

  githubListRepos: (args: { accountId: string }) => Promise<unknown>;
  gitlabListRepos: (args: { accountId: string }) => Promise<unknown>;
};

const invoke = (channel: string, args?: unknown): Promise<unknown> =>
  ipcRenderer.invoke(channel, args);

const api: ApiSchema = {
  getAppInfo: () => invoke('app:info') as Promise<AppInfo>,

  storeGet: (args) => invoke('store:get', args),
  storeSet: (args) => invoke('store:set', args) as Promise<void>,
  storeDelete: (args) => invoke('store:delete', args) as Promise<void>,

  gitStatus: (args) => invoke('git:status', args) as Promise<GitStatus>,
  gitLog: (args) => invoke('git:log', args) as Promise<GitCommit[]>,
  gitDiff: (args) => invoke('git:diff', args) as Promise<DiffHunk[]>,
  gitRevParse: (args) => invoke('git:rev-parse', args) as Promise<string>,
  gitClone: (args) => invoke('git:clone', args),
  gitFetch: (args) => invoke('git:fetch', args),
  gitPull: (args) => invoke('git:pull', args),
  gitPush: (args) => invoke('git:push', args),
  gitCommit: (args) => invoke('git:commit', args),
  gitStash: (args) => invoke('git:stash', args),
  gitMerge: (args) => invoke('git:merge', args),
  gitRebase: (args) => invoke('git:rebase', args),
  gitReset: (args) => invoke('git:reset', args),
  gitRevert: (args) => invoke('git:revert', args),
  gitAmend: (args) => invoke('git:amend', args),
  gitCheckout: (args) => invoke('git:checkout', args),
  gitBranch: (args) => invoke('git:branch', args),
  gitTag: (args) => invoke('git:tag', args),
  gitPatch: (args) => invoke('git:patch', args),
  gitConfig: (args) => invoke('git:config', args),
  gitHooks: (args) => invoke('git:hooks', args),

  fsSize: (args) => invoke('fs:size', args),
  fsIcon: (args) => invoke('fs:icon', args),
  fsWorkspaceList: (args) => invoke('fs:workspace-list', args),

  authGithubStart: () => invoke('auth:github-start'),
  authGithubComplete: (args) => invoke('auth:github-complete', args),
  authGitlabStart: () => invoke('auth:gitlab-start'),
  authGitlabComplete: (args) => invoke('auth:gitlab-complete', args),
  accountList: () => invoke('account:list'),
  accountSetActive: (args) => invoke('account:set-active', args),
  accountRemove: (args) => invoke('account:remove', args),

  githubListRepos: (args) => invoke('github:list-repos', args),
  gitlabListRepos: (args) => invoke('gitlab:list-repos', args)
};

contextBridge.exposeInMainWorld('api', api);
