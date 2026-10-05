import { Bot, Star } from 'lucide-react';
import type { FC } from 'react';

import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuRoot
} from '@/shared/ui/dropdown-menu';

import type { AgentMenuProps } from './types';

export const AgentMenu: FC<AgentMenuProps> = ({
  agents,
  defaultAgentId,
  open,
  onOpenChange,
  onSelect
}) => (
  <DropdownMenuRoot open={open} onOpenChange={onOpenChange}>
    <DropdownMenuPortal>
      <DropdownMenuPositioner sideOffset={6} align="end">
        <DropdownMenuContent className="min-w-48">
          <DropdownMenuLabel>Open with</DropdownMenuLabel>
          {agents.map((agent) => {
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
        </DropdownMenuContent>
      </DropdownMenuPositioner>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
);

AgentMenu.displayName = 'AgentMenu';