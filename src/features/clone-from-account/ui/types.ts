import type { UseCloneFromRepoDeps } from '../model';

export type ActiveWorkspace = {
  id: string;
  name: string;
  path: string;
} | null;

export type CloneFromAccountDialogProps = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  activeWorkspace: ActiveWorkspace;
  deps?: Partial<UseCloneFromRepoDeps>;
};
