import { FolderOpen } from 'lucide-react';
import type { FC } from 'react';

import { cn } from '@/shared/lib/theme';

import type { EmptyProps } from './types';

const Empty: FC<EmptyProps> = ({ icon, title, description, action, className }) => (
  <div
    className={cn(
      'border-border bg-muted/30 text-foreground flex flex-col items-center justify-center gap-3 rounded-md border border-dashed px-6 py-12 text-center',
      className
    )}
  >
    <div className="bg-background text-muted-foreground flex size-12 items-center justify-center rounded-full border border-border">
      {icon ?? <FolderOpen className="size-6" />}
    </div>
    <div className="flex flex-col gap-1">
      <h3 className="text-base font-semibold">{title}</h3>
      {description && (
        <p className="text-muted-foreground max-w-sm text-sm">{description}</p>
      )}
    </div>
    {action && <div className="mt-2">{action}</div>}
  </div>
);

export { Empty };
