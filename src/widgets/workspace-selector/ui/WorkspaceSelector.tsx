import { useState } from 'react';
import type { FC } from 'react';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAppStore } from '@/app/store';
import {
  useActiveWorkspace,
  useWorkspaceList
} from '@/entities/workspace';
import { CreateWorkspaceDialog } from '@/features/workspace-create';
import { cn } from '@/shared/lib/theme';
import { useToast } from '@/shared/ui';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/shared/ui/dropdown-menu';

import type { WorkspaceSelectorProps } from '../types';

export const WorkspaceSelector: FC<WorkspaceSelectorProps> = ({
  workspaceId,
  className
}) => {
  const navigate = useNavigate();
  const active = useActiveWorkspace();
  const { data: workspaces = [] } = useWorkspaceList();
  const setActiveWorkspaceId = useAppStore((s) => s.setActiveWorkspaceId);
  const toast = useToast();
  const [createOpen, setCreateOpen] = useState(false);

  const handleSwitch = (id: string, name: string): void => {
    if (id === workspaceId) return;
    setActiveWorkspaceId(id);
    navigate(`/workspaces/${id}`);
    toast.success({ title: 'Workspace changed', description: name });
  };

  const handleManage = (): void => {
    navigate('/workspaces');
  };

  return (
    <>
      <DropdownMenuRoot>
        <DropdownMenuTrigger
          className={cn(
            'text-foreground hover:bg-surface-elevated flex h-8 items-center gap-2 rounded-md px-3 text-sm transition-colors',
            'duration-(--duration-fast)',
            className
          )}
        >
          <span className="font-medium">{active?.name ?? 'Select workspace'}</span>
          <ChevronDown aria-hidden="true" className="text-muted-foreground size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuPositioner sideOffset={6} align="start">
            <DropdownMenuContent className="min-w-64">
              {workspaces.map((ws) => (
                <DropdownMenuItem
                  key={ws.id}
                  onClick={() => handleSwitch(ws.id, ws.name)}
                  disabled={ws.id === workspaceId}
                >
                  {ws.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setCreateOpen(true)}>
                + New workspace…
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleManage}>
                Manage workspaces…
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPositioner>
        </DropdownMenuPortal>
      </DropdownMenuRoot>
      <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
};

WorkspaceSelector.displayName = 'WorkspaceSelector';
