import { Plus } from 'lucide-react';
import type { FC } from 'react';

import { cn } from '@/shared/lib/theme';

type NewWorkspaceTileProps = {
  onClick: () => void;
};

export const NewWorkspaceTile: FC<NewWorkspaceTileProps> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'border-border hover:border-primary hover:bg-primary/5 flex h-44 w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed',
      'transition-colors duration-(--duration-fast)'
    )}
  >
    <Plus aria-hidden="true" className="text-primary size-8" />
    <span className="text-muted-foreground text-sm font-medium">
      New workspace
    </span>
  </button>
);

NewWorkspaceTile.displayName = 'NewWorkspaceTile';
