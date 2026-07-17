export type CommitMessage = {
  header: string;
  body?: string;
  footer?: string;
};

export type CommitMessageFormProps = {
  initialValues?: Partial<CommitMessage>;
  isSubmitting?: boolean;
  showBypass?: boolean;
  showAmend?: boolean;
  bypassChecked?: boolean;
  className?: string;
  onCommit: (message: CommitMessage) => void;
  onBypassChange?: (checked: boolean) => void;
  onAmend?: () => void;
};