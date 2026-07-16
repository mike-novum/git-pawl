import { app, BrowserWindow, ipcMain, nativeImage, shell } from 'electron';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { IPC_CHANNELS } from '../shared/ipc-channels';
import {
  accountRemoveSchema,
  accountSetActiveSchema,
  authGithubCompleteSchema,
  authGitlabCompleteSchema,
  fsIconSchema,
  fsSizeSchema,
  fsWorkspaceListSchema,
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

import { storeDelete, storeGet, storeSet } from './services/store';
import { gitClone } from './services/git/clone';
import { gitFetch, gitPull, gitPush } from './services/git/network';
import { emitCloneProgress } from './services/git/progress';

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

const echo = async (args: unknown): Promise<unknown> => args;

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

  safeHandle(IPC_CHANNELS.GIT_STATUS, gitStatusSchema, echo);
  safeHandle(IPC_CHANNELS.GIT_LOG, gitLogSchema, echo);
  safeHandle(IPC_CHANNELS.GIT_DIFF, gitDiffSchema, echo);
  safeHandle(IPC_CHANNELS.GIT_REV_PARSE, gitRevParseSchema, echo);
  safeHandle(IPC_CHANNELS.GIT_CLONE, gitCloneSchema, (args, event) => {
    if (!event) throw new Error('Missing IPC event for clone progress');
    return gitClone(args, (msg) => emitCloneProgress(event.sender, msg));
  });
  safeHandle(IPC_CHANNELS.GIT_FETCH, gitFetchSchema, (args) => gitFetch(args));
  safeHandle(IPC_CHANNELS.GIT_PULL, gitPullSchema, (args) => gitPull(args));
  safeHandle(IPC_CHANNELS.GIT_PUSH, gitPushSchema, (args) => gitPush(args));
  safeHandle(IPC_CHANNELS.GIT_COMMIT, gitCommitSchema, echo);
  safeHandle(IPC_CHANNELS.GIT_STASH, gitStashSchema, echo);
  safeHandle(IPC_CHANNELS.GIT_MERGE, gitMergeSchema, echo);
  safeHandle(IPC_CHANNELS.GIT_REBASE, gitRebaseSchema, echo);
  safeHandle(IPC_CHANNELS.GIT_RESET, gitResetSchema, echo);
  safeHandle(IPC_CHANNELS.GIT_REVERT, gitRevertSchema, echo);
  safeHandle(IPC_CHANNELS.GIT_AMEND, gitAmendSchema, echo);
  safeHandle(IPC_CHANNELS.GIT_CHECKOUT, gitCheckoutSchema, echo);
  safeHandle(IPC_CHANNELS.GIT_BRANCH, gitBranchSchema, echo);
  safeHandle(IPC_CHANNELS.GIT_TAG, gitTagSchema, echo);
  safeHandle(IPC_CHANNELS.GIT_PATCH, gitPatchSchema, echo);
  safeHandle(IPC_CHANNELS.GIT_CONFIG, gitConfigSchema, echo);
  safeHandle(IPC_CHANNELS.GIT_HOOKS, gitHooksSchema, echo);

  safeHandle(IPC_CHANNELS.FS_SIZE, fsSizeSchema, echo);
  safeHandle(IPC_CHANNELS.FS_ICON, fsIconSchema, echo);
  safeHandle(IPC_CHANNELS.FS_WORKSPACE_LIST, fsWorkspaceListSchema, echo);

  safeHandleNoArgs(IPC_CHANNELS.AUTH_GITHUB_START, () => null);
  safeHandle(IPC_CHANNELS.AUTH_GITHUB_COMPLETE, authGithubCompleteSchema, echo);
  safeHandleNoArgs(IPC_CHANNELS.AUTH_GITLAB_START, () => null);
  safeHandle(IPC_CHANNELS.AUTH_GITLAB_COMPLETE, authGitlabCompleteSchema, echo);
  safeHandleNoArgs(IPC_CHANNELS.ACCOUNT_LIST, () => []);
  safeHandle(IPC_CHANNELS.ACCOUNT_SET_ACTIVE, accountSetActiveSchema, echo);
  safeHandle(IPC_CHANNELS.ACCOUNT_REMOVE, accountRemoveSchema, echo);

  safeHandle(IPC_CHANNELS.GITHUB_LIST_REPOS, githubListReposSchema, echo);
  safeHandle(IPC_CHANNELS.GITLAB_LIST_REPOS, gitlabListReposSchema, echo);
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