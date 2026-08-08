import { FolderOpen } from 'lucide-react';
import type { FC } from 'react';

import { useToast } from '@/shared/ui/toast';

import { openInFinder } from '../model';

import type { OpenInFinderProps } from './types';

export const OpenInFinder: FC<OpenInFinderProps> = ({
  path,
  className
}) => {
  const toast = useToast();

  const handleClick = (): void => {
    if (!path) return;
    void openInFinder({ path })
      .then(() => {
        toast.success({ title: 'Finder opened' });
      })
      .catch((err: unknown) => {
        toast.error({
          title: 'Failed to open Finder',
          description: err instanceof Error ? err.message : String(err)
        });
      });
  };

  return (
    <button
      type="button"
      aria-label="Open in Finder"
      title="Open in Finder"
      onClick={handleClick}
      disabled={!path}
      className={
        className ??
        'text-muted-foreground hover:bg-surface-elevated hover:text-foreground flex size-8 items-center justify-center rounded-md transition-colors duration-(--duration-fast) disabled:opacity-50'
      }
    >
      <FolderOpen aria-hidden="true" className="size-4" />
    </button>
  );
};

OpenInFinder.displayName = 'OpenInFinder';
