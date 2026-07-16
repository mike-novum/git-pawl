import { app } from 'electron';
import Store from 'electron-store';

type StoreShape = Record<string, unknown>;

const STORE_NAME = 'git-pawl';

export const store = new Store<StoreShape>({
  name: STORE_NAME,
  cwd: app.getPath('userData')
});

export const storeGet = <T = unknown>(key: string): T | undefined =>
  store.get(key) as T | undefined;

export const storeSet = (key: string, value: unknown): void => {
  store.set(key, value as StoreShape[string]);
};

export const storeDelete = (key: string): void => {
  store.delete(key);
};
