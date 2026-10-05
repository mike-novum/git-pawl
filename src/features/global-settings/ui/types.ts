export type ThemePreference = 'dark' | 'light' | 'system';

export type DiffViewMode = 'unified' | 'split';

export type AgentId = 'claude' | 'cursor' | 'opencode' | 'kilo' | 'kimi' | 'qwen';

export type GlobalSettingsValues = {
  theme: ThemePreference;
  editor: string;
  autoFetchInterval: number;
  diffViewMode: DiffViewMode;
  confirmDestructiveOps: boolean;
  defaultAgent: AgentId;
};

export type SettingsDialogProps = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
};

export type SettingsFormProps = {
  onSuccess?: () => void;
};