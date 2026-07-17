import type { ConfigScope } from '../model';

export type RepoConfigDialogProps = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  repoPath: string;
};

export type ConfigRowProps = {
  repoPath: string;
  configKey: string;
  label: string;
  placeholder?: string;
  scope: ConfigScope;
  disabled: boolean;
  onSave: (input: { key: string; value: string; scope: ConfigScope }) => void;
  isSaving: boolean;
};

export type ConfigFieldSpec = {
  key: string;
  label: string;
  placeholder: string;
  scope: ConfigScope;
};
