import { useMemo, useState } from 'react';
import type { FC } from 'react';
import { Check, ChevronDown, Folder, Plus } from 'lucide-react';

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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/shared/ui/dropdown-menu';

import type { WorkspaceSwitcherProps } from './types';

export const WorkspaceSwitcher: FC<WorkspaceSwitcherProps> = ({
  className
}) => {
  const active = useActiveWorkspace();
  const { data: workspaces = [] } = useWorkspaceList();
  const setActiveWorkspaceId = useAppStore((state) => state.setActiveWorkspaceId);
  const toast = useToast();
  const [createOpen, setCreateOpen] = useState(false);

  const others = useMemo(
    () =>
      active
        ? workspaces.filter((workspace) => workspace.id !== active.id)
        : workspaces,
    [workspaces, active]
  );

  const handleSwitch = (id: string, name: string): void => {
    if (id === active?.id) return;
    setActiveWorkspaceId(id);
    toast.success({
      title: 'Workspace changed',
      description: name
    });
  };

  return (
    <>
      <DropdownMenuRoot>
        <DropdownMenuTrigger
          aria-label={
            active ? `Active workspace: ${active.name}` : 'Select workspace'
          }
          className={cn(
            'flex w-full items-center justify-between gap-2 rounded-md border bg-card px-3 py-1.5 text-sm',
            'transition-colors duration-(--duration-fast) ease-(--ease-fast) hover:bg-muted',
            active ? 'border-border' : 'border-dashed border-border',
            className
          )}
        >
          {active ? (
            <Folder
              aria-hidden="true"
              className="text-muted-foreground size-4 shrink-0"
            />
          ) : (
            <Plus
              aria-hidden="true"
              className="text-muted-foreground size-4 shrink-0"
            />
          )}
          <span
            className={cn(
              'flex-1 truncate text-left font-medium',
              active ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {active ? active.name : 'Select workspace'}
          </span>
          <ChevronDown
            aria-hidden="true"
            className="text-muted-foreground size-4 shrink-0"
          />
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuPositioner sideOffset={6} align="start">
            <DropdownMenuContent className="min-w-64">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Active</DropdownMenuLabel>
                {active ? (
                  <DropdownMenuItem disabled>
                    <Folder aria-hidden="true" className="text-muted-foreground size-4" />
                    <span className="flex-1 truncate text-left font-medium">
                      {active.name}
                    </span>
                    <Check aria-hidden="true" className="text-primary size-4" />
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem disabled className="text-muted-foreground">
                    No active workspace
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>

              {others.length > 0 ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Other workspaces</DropdownMenuLabel>
                    {others.map((workspace) => (
                      <DropdownMenuItem
                        key={workspace.id}
                        onClick={() => handleSwitch(workspace.id, workspace.name)}
                      >
                        <Folder
                          aria-hidden="true"
                          className="text-muted-foreground size-4"
                        />
                        <span className="flex-1 truncate text-left font-medium">
                          {workspace.name}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </>
              ) : null}

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setCreateOpen(true)}>
                <Plus aria-hidden="true" className="text-muted-foreground size-4" />
                New workspace...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPositioner>
        </DropdownMenuPortal>
      </DropdownMenuRoot>

      <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
};

WorkspaceSwitcher.displayName = 'WorkspaceSwitcher';
