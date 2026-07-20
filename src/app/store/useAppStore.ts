import { createPersistedStore } from '@/shared/lib/store';

import type { AppState } from './types';

export const useAppStore = createPersistedStore<AppState>('app', (set) => ({
  theme: 'dark',
  setTheme: (theme) => {
    set({ theme });
  },

  activeWorkspaceId: null,
  setActiveWorkspaceId: (id) => {
    set({ activeWorkspaceId: id });
  },

  activeAccountId: null,
  setActiveAccountId: (id) => {
    set({ activeAccountId: id });
  },

  selectedRepoId: null,
  setSelectedRepoId: (id) => {
    set({ selectedRepoId: id });
  },

  workspaceCounters: {},
  setWorkspaceCounters: (id, counters) => {
    set((state) => ({
      workspaceCounters: { ...state.workspaceCounters, [id]: counters }
    }));
  }
}));