import { Trash2 } from 'lucide-react';
import type { FC } from 'react';
import { useState } from 'react';

import { fsSelectFile } from '@/shared/api';
import { Button, Drawer, Input } from '@/shared/ui';

import type { WorkspaceSettingsDrawerProps } from '../types';

const getIconName = (iconPath: string): string =>
  iconPath.split(/[\\/]/).pop() ?? iconPath;

export const WorkspaceSettingsDrawer: FC<WorkspaceSettingsDrawerProps> = ({
  workspace,
  open,
  onOpenChange,
  onSave = () => {},
  onIconChange,
  onDelete
}) => {
  const [name, setName] = useState(workspace.name);
  const [selectedIconPath, setSelectedIconPath] = useState<string | null>(null);

  const handleDelete = (): void => {
    if (window.confirm('Delete this workspace? Files on disk will stay intact.')) {
      onDelete();
    }
  };

  const handleIconChange = async (): Promise<void> => {
    const iconPath = await fsSelectFile();
    if (!iconPath) return;

    setSelectedIconPath(iconPath);
    onIconChange?.(iconPath);
  };

  const handleDone = (): void => {
    onSave(name);
    onOpenChange(false);
  };

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="Workspace settings"
      description={`General preferences for ${workspace.name}`}
      footer={
        <div className="flex w-full items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={handleDelete}
            className="text-danger hover:bg-danger/10"
          >
            <Trash2 aria-hidden="true" className="size-4" />
            Delete workspace
          </Button>
          <Button type="button" onClick={handleDone}>
            Done
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-2">
          <label
            htmlFor="workspace-name"
            className="text-foreground text-sm font-medium"
          >
            Name
          </label>
          <Input
            id="workspace-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </section>
        <section className="flex flex-col gap-2">
          <span className="text-foreground text-sm font-medium">Path</span>
          <p className="bg-surface-elevated text-muted-foreground rounded-md px-3 py-2 font-mono text-xs">
            {workspace.path}
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <span className="text-foreground text-sm font-medium">Icon</span>
          <button
            type="button"
            onClick={() => {
              void handleIconChange();
            }}
            className="bg-surface-elevated text-muted-foreground hover:border-primary flex h-20 w-20 items-center justify-center rounded-lg border border-dashed transition-colors"
          >
            {selectedIconPath ? getIconName(selectedIconPath) : 'Change'}
          </button>
        </section>
      </div>
    </Drawer>
  );
};

WorkspaceSettingsDrawer.displayName = 'WorkspaceSettingsDrawer';
