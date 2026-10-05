import { Bot, Star } from 'lucide-react';
import type { FC, ReactElement } from 'react';

import {
  ContextMenuRoot,
  ContextMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuPositioner
} from '@/shared/ui/dropdown-menu';

import type { AgentMenuProps } from './types';

export const AgentMenu: FC<AgentMenuProps> = ({
  agents: agentDescriptors,
  defaultAgentId,
  onSelect,
  trigger
}) => (
  <ContextMenuRoot>
    <ContextMenuTrigger render={trigger as ReactElement<{ onContextMenu?: unknown }>} />
    <DropdownMenuPortal>
      <DropdownMenuPositioner sideOffset={6} align="end">
        <DropdownMenuContent className="min-w-48">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Open with</DropdownMenuLabel>
            {agentDescriptors.map((agent) => {
              const isDefault = agent.id === defaultAgentId;
              return (
                <DropdownMenuItem
                  key={agent.id}
                  disabled={!agent.available}
                  onClick={() => onSelect(agent.id)}
                >
                  <Bot
                    aria-hidden="true"
                    className="text-muted-foreground size-4"
                  />
                  <span className="flex-1">Open in {agent.name}</span>
                  {isDefault ? (
                    <Star
                      aria-hidden="true"
                      className="text-primary size-3.5"
                    />
                  ) : null}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenuPositioner>
    </DropdownMenuPortal>
  </ContextMenuRoot>
);

AgentMenu.displayName = 'AgentMenu';