import { create, type StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';

export const createPersistedStore = <T extends object>(
  name: string,
  creator: StateCreator<T>
) =>
  create(
    persist(creator, {
      name: `git-pawl.${name}`,
      version: 1
    })
  );