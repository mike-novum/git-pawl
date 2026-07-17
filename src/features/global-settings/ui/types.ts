export type ThemePreference = 'dark' | 'light' | 'system';

export type DiffViewMode = 'unified' | 'split';

export type GlobalSettingsValues = {
  theme: ThemePreference;
  editor: string;
  autoFetchInterval: number;
  diffViewMode: DiffViewMode;
  confirmDestructiveOps: boolean;
};

export type SettingsDialogProps = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
};

export type SettingsFormProps = {
  onSuccess?: () => void;
};