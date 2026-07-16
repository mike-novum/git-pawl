export type ThemeMode = 'dark' | 'light';

export type AppState = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;

  activeWorkspaceId: string | null;
  setActiveWorkspaceId: (id: string | null) => void;

  activeAccountId: string | null;
  setActiveAccountId: (id: string | null) => void;

  selectedRepoId: string | null;
  setSelectedRepoId: (id: string | null) => void;
};