import { Monitor } from 'lucide-react';
import type { FC } from 'react';

import { useToast } from '@/shared/ui/toast';

import { openInTerminal } from '../model';

import type { OpenInTerminalProps } from './types';

export const OpenInTerminal: FC<OpenInTerminalProps> = ({
  path,
  className
}) => {
  const toast = useToast();

  const handleClick = (): void => {
    if (!path) return;
    void openInTerminal({ path })
      .then(() => {
        toast.success({ title: 'Terminal opened' });
      })
      .catch((err: unknown) => {
        toast.error({
          title: 'Failed to open terminal',
          description: err instanceof Error ? err.message : String(err)
        });
      });
  };

  return (
    <button
      type="button"
      aria-label="Open in terminal"
      title="Open in terminal"
      onClick={handleClick}
      disabled={!path}
      className={
        className ??
        'text-muted-foreground hover:bg-surface-elevated hover:text-foreground flex size-8 items-center justify-center rounded-md transition-colors duration-(--duration-fast) disabled:opacity-50'
      }
    >
      <Monitor aria-hidden="true" className="size-4" />
    </button>
  );
};

OpenInTerminal.displayName = 'OpenInTerminal';
