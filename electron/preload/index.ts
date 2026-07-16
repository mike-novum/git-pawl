import { contextBridge, ipcRenderer } from 'electron';

export type AppInfo = {
  name: string;
  version: string;
  electron: string;
  node: string;
};

export type StoreGetArgs = { key: string };
export type StoreSetArgs = { key: string; value: unknown };
export type StoreDeleteArgs = { key: string };

export type ExposedApi = {
  getAppInfo: () => Promise<AppInfo>;

  storeGet: (args: StoreGetArgs) => Promise<unknown>;
  storeSet: (args: StoreSetArgs) => Promise<void>;
  storeDelete: (args: StoreDeleteArgs) => Promise<void>;
};

const api: ExposedApi = {
  getAppInfo: () => ipcRenderer.invoke('app:info'),

  storeGet: (args) => ipcRenderer.invoke('store:get', args),
  storeSet: (args) => ipcRenderer.invoke('store:set', args) as Promise<void>,
  storeDelete: (args) =>
    ipcRenderer.invoke('store:delete', args) as Promise<void>
};

contextBridge.exposeInMainWorld('api', api);