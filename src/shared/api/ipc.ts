export type AppInfo = {
  name: string;
  version: string;
  electron: string;
  node: string;
};

export type IpcApi = {
  getAppInfo: () => Promise<AppInfo>;
};

declare global {
  interface Window {
    api: IpcApi;
  }
}

export const api: IpcApi = {
  getAppInfo: async () => {
    const win = typeof window !== 'undefined' ? window : undefined;
    if (!win || !('api' in win)) {
      return {
        name: 'git-pawl',
        version: '0.1.0',
        electron: 'dev',
        node: 'dev'
      };
    }

    return win.api.getAppInfo();
  }
};
