import { app, BrowserWindow, ipcMain, nativeImage, shell } from 'electron';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { IPC_CHANNELS } from '../shared/ipc-channels';
import { safeHandle } from '../shared/handler';
import {
  gitCommitSchema,
  gitMergeSchema,
  gitRebaseSchema,
  gitStashSchema
} from '../shared/schemas';

import { gitCommit } from './services/git/commit';
import { gitMerge } from './services/git/merge';
import { gitRebase } from './services/git/rebase';
import { gitStash } from './services/git/stash';

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

  safeHandle(IPC_CHANNELS.GIT_COMMIT, gitCommitSchema, gitCommit);
  safeHandle(IPC_CHANNELS.GIT_STASH, gitStashSchema, gitStash);
  safeHandle(IPC_CHANNELS.GIT_MERGE, gitMergeSchema, gitMerge);
  safeHandle(IPC_CHANNELS.GIT_REBASE, gitRebaseSchema, gitRebase);
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
