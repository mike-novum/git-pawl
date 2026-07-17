export type SetRepoIconDialogProps = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  repoPath: string;
  repoName?: string;
};
