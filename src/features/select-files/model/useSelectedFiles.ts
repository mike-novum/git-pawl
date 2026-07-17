import { create } from 'zustand';

export type SelectedFilesState = {
  selectedByRepo: Record<string, string[]>;
  toggle: (repoPath: string, path: string) => void;
  selectAll: (repoPath: string, paths: string[]) => void;
  deselectAll: (repoPath: string) => void;
};

export const useSelectedFilesStore = create<SelectedFilesState>((set) => ({
  selectedByRepo: {},
  toggle: (repoPath, path) =>
    set((state) => {
      const current = state.selectedByRepo[repoPath] ?? [];
      const next = current.includes(path)
        ? current.filter((item) => item !== path)
        : [...current, path];

      return {
        selectedByRepo: { ...state.selectedByRepo, [repoPath]: next }
      };
    }),
  selectAll: (repoPath, paths) =>
    set((state) => ({
      selectedByRepo: { ...state.selectedByRepo, [repoPath]: [...paths] }
    })),
  deselectAll: (repoPath) =>
    set((state) => ({
      selectedByRepo: { ...state.selectedByRepo, [repoPath]: [] }
    }))
}));

export type SelectedFilesApi = {
  selected: string[];
  count: number;
  isSelected: (path: string) => boolean;
  toggle: (path: string) => void;
  selectAll: (paths: string[]) => void;
  deselectAll: () => void;
};

export const useSelectedFiles = (repoPath: string): SelectedFilesApi => {
  const selected = useSelectedFilesStore(
    (state) => state.selectedByRepo[repoPath] ?? []
  );
  const toggle = useSelectedFilesStore((state) => state.toggle);
  const selectAll = useSelectedFilesStore((state) => state.selectAll);
  const deselectAll = useSelectedFilesStore((state) => state.deselectAll);

  return {
    selected,
    count: selected.length,
    isSelected: (path: string) => selected.includes(path),
    toggle: (path: string) => toggle(repoPath, path),
    selectAll: (paths: string[]) => selectAll(repoPath, paths),
    deselectAll: () => deselectAll(repoPath)
  };
};
