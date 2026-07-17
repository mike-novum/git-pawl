import type { FC } from 'react';

import type { EmptyStateProps } from '../types';

export const EmptyState: FC<EmptyStateProps> = ({
  title,
  description,
  action
}) => {
  return (
    <div className="border-border bg-muted/30 flex h-full w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-12 text-center">
      <h2 className="text-foreground text-2xl font-semibold">{title}</h2>
      {description ? (
        <p className="text-muted-foreground max-w-md text-sm">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
};

EmptyState.displayName = 'EmptyState';