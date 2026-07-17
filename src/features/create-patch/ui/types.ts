import type { Commit } from '@electron/shared/types/git';

export type CreatePatchDialogProps = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  repoPath: string;
};

export type CommitPickerProps = {
  commits: Commit[];
  isLoading: boolean;
  selectedHash: string;
  onSelect: (hash: string) => void;
  disabled?: boolean;
  label: string;
};
