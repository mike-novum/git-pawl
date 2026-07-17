import { app, BrowserWindow, ipcMain, nativeImage, shell } from 'electron';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { IPC_CHANNELS } from '../shared/ipc-channels';
import {
  accountRemoveSchema,
  accountSetActiveSchema,
  authGithubCompleteSchema,
  authGitlabCompleteSchema,
  currentBranchSchema,
  fsBuildRepoIdSchema,
  fsDetectReposSchema,
  fsIconSchema,
  fsScanReposSchema,
  fsSizeSchema,
  fsWorkspaceCreateSchema,
  gitAmendSchema,
  gitBranchSchema,
  gitCheckoutSchema,
  gitCloneSchema,
  gitCommitSchema,
  gitConfigSchema,
  gitDiffSchema,
  gitFetchSchema,
  gitHooksSchema,
  gitLogSchema,
  gitMergeSchema,
  gitPatchSchema,
  gitPullSchema,
  gitPushSchema,
  gitRebaseSchema,
  gitResetSchema,
  gitRevertSchema,
  gitRevParseSchema,
  gitStashSchema,
  gitStatusSchema,
  gitTagSchema,
  githubListReposSchema,
  gitlabListReposSchema
} from '../shared/schemas';
import { safeHandle, safeHandleNoArgs } from '../shared/handler';

import {
  getRepoSize,
  removeRepoIcon,
  selectDirectory,
  setRepoIcon,
  workspaceCreate,
  workspaceList
} from './services/fs';
import {
  buildRepoId,
  detectRepos,
  scanRepos
} from './services/fs-scanner';
import { storeDelete, storeGet, storeSet } from './services/store';
import { gitAmend } from './services/git/amend';
import { gitBranch } from './services/git/branch';
import { gitCheckout } from './services/git/checkout';
import { gitClone } from './services/git/clone';
import { gitCommit } from './services/git/commit';
import { currentBranch } from './services/git/currentBranch';
import { gitDiff, gitLog, gitRevParse, gitStatus } from './services/git';
import { gitFetch, gitPull, gitPush } from './services/git/network';
import { gitMerge } from './services/git/merge';
import { emitCloneProgress } from './services/git/progress';
import { gitRebase } from './services/git/rebase';
import { gitReset } from './services/git/reset';
import { gitRevert } from './services/git/revert';
import { gitStash } from './services/git/stash';
import { gitTag } from './services/git/tag';
import { createPatch } from './services/git/patch';
import { gitGetConfig, gitSetConfig } from './services/git/config';
import { listHooks } from './services/git/hooks';
import {
  disconnectGitHub,
  listGitHubAccounts,
  listGitHubRepos,
  connectGitHubWithToken
} from './services/git-host/github';
import {
  connectGitLabWithToken,
  disconnectGitLab,
  listGitLabAccounts,
  listGitLabRepos
} from './services/git-host/gitlab';

const isDev = !app.isPackaged;

const iconPath = join(__dirname, '../../build/icon.png');

const loadAppIcon = (): ReturnType<typeof nativeImage.createFromPath> | undefined => {
  if (!existsSync(iconPath)) {
    return undefined;
  }
  return nativeImage.createFromPath(iconPath);
};

const createWindow = async (): Promise<void> => {
  const icon = loadAppIcon();

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    title: 'git-pawl',
    ...(icon ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.once('ready-to-show', () => {
    win.show();
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev && process.env.ELECTRON_RENDERER_URL) {
    await win.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    await win.loadFile(join(__dirname, '../renderer/index.html'));
  }

  return Promise.resolve();
};

const registerIpcHandlers = (): void => {
  ipcMain.handle(IPC_CHANNELS.APP_INFO, () => ({
    name: app.getName(),
    version: app.getVersion(),
    electron: process.versions.electron,
    node: process.versions.node
  }));

  ipcMain.handle(IPC_CHANNELS.STORE_GET, (_event, args: { key: string }) =>
    storeGet(args.key)
  );
  ipcMain.handle(
    IPC_CHANNELS.STORE_SET,
    (_event, args: { key: string; value: unknown }) => {
      storeSet(args.key, args.value);
    }
  );
  ipcMain.handle(IPC_CHANNELS.STORE_DELETE, (_event, args: { key: string }) => {
    storeDelete(args.key);
  });

  safeHandle(IPC_CHANNELS.GIT_STATUS, gitStatusSchema, (args) => gitStatus(args));
  safeHandle(IPC_CHANNELS.GIT_LOG, gitLogSchema, (args) => gitLog(args));
  safeHandle(IPC_CHANNELS.GIT_DIFF, gitDiffSchema, (args) => gitDiff(args));
  safeHandle(IPC_CHANNELS.GIT_REV_PARSE, gitRevParseSchema, (args) => gitRevParse(args));
  safeHandle(IPC_CHANNELS.GIT_CLONE, gitCloneSchema, (args, event) => {
    if (!event) throw new Error('Missing IPC event for clone progress');
    return gitClone(args, (msg) => emitCloneProgress(event.sender, msg));
  });
  safeHandle(IPC_CHANNELS.GIT_FETCH, gitFetchSchema, (args) => gitFetch(args));
  safeHandle(IPC_CHANNELS.GIT_PULL, gitPullSchema, (args) => gitPull(args));
  safeHandle(IPC_CHANNELS.GIT_PUSH, gitPushSchema, (args) => gitPush(args));
  safeHandle(IPC_CHANNELS.GIT_COMMIT, gitCommitSchema, gitCommit);
  safeHandle(IPC_CHANNELS.GIT_STASH, gitStashSchema, gitStash);
  safeHandle(IPC_CHANNELS.GIT_MERGE, gitMergeSchema, gitMerge);
  safeHandle(IPC_CHANNELS.GIT_REBASE, gitRebaseSchema, gitRebase);

  safeHandle(IPC_CHANNELS.GIT_RESET, gitResetSchema, async (args) => {
    await gitReset(args);
  });
  safeHandle(IPC_CHANNELS.GIT_REVERT, gitRevertSchema, async (args) => {
    await gitRevert(args);
  });
  safeHandle(IPC_CHANNELS.GIT_AMEND, gitAmendSchema, async (args) => gitAmend(args));
  safeHandle(IPC_CHANNELS.GIT_CHECKOUT, gitCheckoutSchema, async (args) => {
    await gitCheckout(args);
  });
  safeHandle(IPC_CHANNELS.GIT_BRANCH, gitBranchSchema, async (args) => gitBranch(args));
  safeHandle(IPC_CHANNELS.GIT_CURRENT_BRANCH, currentBranchSchema, async (args) =>
    currentBranch(args.repoPath)
  );

  safeHandle(IPC_CHANNELS.GIT_STATUS, gitStatusSchema, (args) => gitStatus(args));
  safeHandle(IPC_CHANNELS.GIT_LOG, gitLogSchema, (args) => gitLog(args));
  safeHandle(IPC_CHANNELS.GIT_DIFF, gitDiffSchema, (args) => gitDiff(args));
  safeHandle(IPC_CHANNELS.GIT_REV_PARSE, gitRevParseSchema, (args) => gitRevParse(args));

  safeHandle(IPC_CHANNELS.GIT_TAG, gitTagSchema, gitTag);
  safeHandle(IPC_CHANNELS.GIT_PATCH, gitPatchSchema, createPatch);
  safeHandle(IPC_CHANNELS.GIT_CONFIG, gitConfigSchema, async (args) => {
    if (args.value === undefined) return gitGetConfig(args);
    return gitSetConfig(args);
  });
  safeHandle(IPC_CHANNELS.GIT_HOOKS, gitHooksSchema, listHooks);

  safeHandleNoArgs(IPC_CHANNELS.FS_SELECT_DIRECTORY, selectDirectory);
  safeHandle(IPC_CHANNELS.FS_SIZE, fsSizeSchema, getRepoSize);
  safeHandle(IPC_CHANNELS.FS_ICON, fsIconSchema, async (args) => {
    if (args.action === 'set') {
      await setRepoIcon(args);
      return;
    }
    await removeRepoIcon(args);
  });
  safeHandleNoArgs(IPC_CHANNELS.FS_WORKSPACE_LIST, workspaceList);
  safeHandle(IPC_CHANNELS.FS_WORKSPACE_CREATE, fsWorkspaceCreateSchema, workspaceCreate);
  safeHandle(IPC_CHANNELS.FS_DETECT_REPOS, fsDetectReposSchema, detectRepos);
  safeHandle(IPC_CHANNELS.FS_BUILD_REPO_ID, fsBuildRepoIdSchema, buildRepoId);
  safeHandle(IPC_CHANNELS.FS_SCAN_REPOS, fsScanReposSchema, scanRepos);

  safeHandleNoArgs(IPC_CHANNELS.AUTH_GITHUB_START, () => null);
  safeHandle(IPC_CHANNELS.AUTH_GITHUB_COMPLETE, authGithubCompleteSchema, (args) =>
    connectGitHubWithToken(args.code)
  );
  safeHandleNoArgs(IPC_CHANNELS.AUTH_GITLAB_START, () => null);
  safeHandle(IPC_CHANNELS.AUTH_GITLAB_COMPLETE, authGitlabCompleteSchema, (args) =>
    connectGitLabWithToken(args.code)
  );
  safeHandleNoArgs(IPC_CHANNELS.ACCOUNT_LIST, () => [
    ...listGitHubAccounts(),
    ...listGitLabAccounts()
  ]);
  safeHandle(IPC_CHANNELS.ACCOUNT_SET_ACTIVE, accountSetActiveSchema, (args) => {
    storeSet('active-account-id', args.id);
  });
  safeHandle(IPC_CHANNELS.ACCOUNT_REMOVE, accountRemoveSchema, (args) => {
    if (args.id.startsWith('gitlab:')) {
      disconnectGitLab(args.id);
      return;
    }
    disconnectGitHub(args.id);
  });

  safeHandle(IPC_CHANNELS.GITHUB_LIST_REPOS, githubListReposSchema, (args) =>
    listGitHubRepos(args.accountId)
  );
  safeHandle(IPC_CHANNELS.GITLAB_LIST_REPOS, gitlabListReposSchema, (args) =>
    listGitLabRepos(args.accountId)
  );
};

app.whenReady().then(async () => {
  registerIpcHandlers();

  if (process.platform === 'darwin') {
    const dockIcon = loadAppIcon();
    if (dockIcon) {
      app.dock.setIcon(dockIcon);
    }
  }

  await createWindow();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});