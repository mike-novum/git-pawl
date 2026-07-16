import { app, BrowserWindow, ipcMain, nativeImage, shell } from 'electron';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { storeDelete, storeGet, storeSet } from './services/store';

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
  ipcMain.handle('app:info', () => ({
    name: app.getName(),
    version: app.getVersion(),
    electron: process.versions.electron,
    node: process.versions.node
  }));

  ipcMain.handle('store:get', (_event, args: { key: string }) =>
    storeGet(args.key)
  );
  ipcMain.handle(
    'store:set',
    (_event, args: { key: string; value: unknown }) => {
      storeSet(args.key, args.value);
    }
  );
  ipcMain.handle('store:delete', (_event, args: { key: string }) => {
    storeDelete(args.key);
  });

  ipcMain.handle('git:status', (_event, args) => echo(args));
  ipcMain.handle('git:log', (_event, args) => echo(args));
  ipcMain.handle('git:diff', (_event, args) => echo(args));
  ipcMain.handle('git:rev-parse', (_event, args) => echo(args));
  ipcMain.handle('git:clone', (_event, args) => echo(args));
  ipcMain.handle('git:fetch', (_event, args) => echo(args));
  ipcMain.handle('git:pull', (_event, args) => echo(args));
  ipcMain.handle('git:push', (_event, args) => echo(args));
  ipcMain.handle('git:commit', (_event, args) => echo(args));
  ipcMain.handle('git:stash', (_event, args) => echo(args));
  ipcMain.handle('git:merge', (_event, args) => echo(args));
  ipcMain.handle('git:rebase', (_event, args) => echo(args));
  ipcMain.handle('git:reset', (_event, args) => echo(args));
  ipcMain.handle('git:revert', (_event, args) => echo(args));
  ipcMain.handle('git:amend', (_event, args) => echo(args));
  ipcMain.handle('git:checkout', (_event, args) => echo(args));
  ipcMain.handle('git:branch', (_event, args) => echo(args));
  ipcMain.handle('git:tag', (_event, args) => echo(args));
  ipcMain.handle('git:patch', (_event, args) => echo(args));
  ipcMain.handle('git:config', (_event, args) => echo(args));
  ipcMain.handle('git:hooks', (_event, args) => echo(args));

  ipcMain.handle('fs:size', (_event, args) => echo(args));
  ipcMain.handle('fs:icon', (_event, args) => echo(args));
  ipcMain.handle('fs:workspace-list', (_event, args) => echo(args));

  ipcMain.handle('auth:github-start', () => echo(null));
  ipcMain.handle('auth:github-complete', (_event, args) => echo(args));
  ipcMain.handle('auth:gitlab-start', () => echo(null));
  ipcMain.handle('auth:gitlab-complete', (_event, args) => echo(args));
  ipcMain.handle('account:list', () => echo([]));
  ipcMain.handle('account:set-active', (_event, args) => echo(args));
  ipcMain.handle('account:remove', (_event, args) => echo(args));

  ipcMain.handle('github:list-repos', (_event, args) => echo(args));
  ipcMain.handle('gitlab:list-repos', (_event, args) => echo(args));
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
