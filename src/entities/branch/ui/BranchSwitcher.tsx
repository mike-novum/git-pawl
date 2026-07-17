import { Check, GitBranch } from 'lucide-react';
import type { FC, KeyboardEvent } from 'react';

import { cn } from '@/shared/lib/theme';

import type { BranchSwitcherProps } from './types';

const handleKeyDown = (
  event: KeyboardEvent<HTMLLIElement>,
  onSelect: ((branchName: string) => void) | undefined,
  branchName: string
): void => {
  if (!onSelect) return;
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onSelect(branchName);
  }
};

export const BranchSwitcher: FC<BranchSwitcherProps> = ({
  branches,
  current,
  onSelect,
  className
}) => {
  if (branches.length === 0) {
    return (
      <div
        className={cn(
          'text-muted-foreground rounded-md border border-dashed border-border p-4 text-sm',
          className
        )}
      >
        No branches
      </div>
    );
  }

  return (
    <ul
      className={cn(
        'divide-y divide-border rounded-md border border-border bg-card',
        className
      )}
      role="listbox"
      aria-label="Branches"
    >
      {branches.map((branch) => {
        const isCurrent = branch.current || branch.name === current;
        const handleClick = (): void => {
          if (onSelect) onSelect(branch.name);
        };
        return (
          <li
            key={branch.name}
            role="option"
            aria-selected={isCurrent}
            tabIndex={onSelect ? 0 : -1}
            onClick={onSelect ? handleClick : undefined}
            onKeyDown={(event) => handleKeyDown(event, onSelect, branch.name)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm',
              onSelect &&
                'hover:bg-muted/60 focus-visible:ring-ring cursor-pointer focus:outline-none focus-visible:ring-2'
            )}
          >
            <GitBranch className="text-muted-foreground h-3.5 w-3.5" aria-hidden="true" />
            <span className="flex-1 truncate font-mono">{branch.name}</span>
            {isCurrent ? (
              <Check className="h-4 w-4 text-primary" aria-hidden="true" />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
};
