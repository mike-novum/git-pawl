import { Bot } from 'lucide-react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAvailableAgents } from '@/features/open-in-agent';
import { cn } from '@/shared/lib/theme';
import { Badge } from '@/shared/ui';

import type { AgentCounterProps } from '../types';

export const AgentCounter: FC<AgentCounterProps> = ({ className }) => {
  const navigate = useNavigate();
  const { data: agents = [], isLoading } = useAvailableAgents();

  const availableCount = agents.filter((agent) => agent.available).length;
  const totalCount = agents.length;
  const hasAgents = availableCount > 0;

  const handleClick = (): void => {
    window.location.hash = '#/settings';
    void navigate('/settings');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Open settings to manage CLI agents"
      title={
        hasAgents
          ? `${availableCount} of ${totalCount} CLI agents available`
          : 'No CLI agents detected — open settings'
      }
      className={cn(
        'fixed bottom-4 right-4 z-40 transition-opacity',
        'duration-(--duration-fast)',
        className
      )}
    >
      {isLoading ? (
        <Badge variant="outline" size="sm">
          <Bot aria-hidden="true" className="size-3.5" />
          Detecting agents…
        </Badge>
      ) : hasAgents ? (
        <Badge variant="success" size="sm">
          <Bot aria-hidden="true" className="size-3.5" />
          {availableCount} / {totalCount} agents
        </Badge>
      ) : (
        <Badge variant="outline" size="sm">
          <Bot aria-hidden="true" className="size-3.5" />
          No agents — install claude/cursor/…
        </Badge>
      )}
    </button>
  );
};

AgentCounter.displayName = 'AgentCounter';