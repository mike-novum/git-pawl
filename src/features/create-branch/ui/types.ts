export type CreateBranchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repoPath: string;
};