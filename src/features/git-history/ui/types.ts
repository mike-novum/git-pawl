export type ControlsBaseProps = {
  repoPath: string;
  disabled?: boolean;
  className?: string;
};

export type ResetControlsProps = ControlsBaseProps;

export type RevertControlsProps = ControlsBaseProps;

export type AmendDialogProps = ControlsBaseProps & {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  initialMessage?: string;
};
