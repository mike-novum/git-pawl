import { contextBridge, ipcRenderer } from 'electron';

export type AppInfo = {
  name: string;
  version: string;
  electron: string;
  node: string;
};

export type ExposedApi = {
  getAppInfo: () => Promise<AppInfo>;
};

const api: ExposedApi = {
  getAppInfo: () => ipcRenderer.invoke('app:info')
};

contextBridge.exposeInMainWorld('api', api);