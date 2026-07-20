export type ThemeMode = 'dark' | 'light';

export type WorkspaceCounters = {
  repoCount: number;
  modifiedCount: number;
  sizeBytes: number | null;
  updatedAt: number;
};

export type AppState = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;

  activeWorkspaceId: string | null;
  setActiveWorkspaceId: (id: string | null) => void;

  activeAccountId: string | null;
  setActiveAccountId: (id: string | null) => void;

  selectedRepoId: string | null;
  setSelectedRepoId: (id: string | null) => void;

  workspaceCounters: Record<string, WorkspaceCounters>;
  setWorkspaceCounters: (id: string, counters: WorkspaceCounters) => void;
};