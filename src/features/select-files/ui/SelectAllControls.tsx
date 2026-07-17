import type { FC } from 'react';
import { CheckSquare, Square } from 'lucide-react';

import { cn } from '@/shared/lib';
import { Button } from '@/shared/ui';

import { useSelectedFiles } from '../model';

import type { SelectAllControlsProps } from './types';

export const SelectAllControls: FC<SelectAllControlsProps> = ({
  repoPath,
  paths,
  className
}) => {
  const { count, selectAll, deselectAll } = useSelectedFiles(repoPath);

  const allSelected = paths.length > 0 && count === paths.length;
  const noneSelected = count === 0;

  const handleSelectAll = (): void => {
    if (allSelected) return;
    selectAll(paths);
  };

  const handleDeselectAll = (): void => {
    if (noneSelected) return;
    deselectAll();
  };

  return (
    <div
      className={cn('flex items-center gap-2', className)}
      role="group"
      aria-label="Bulk selection"
    >
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={handleSelectAll}
        disabled={allSelected || paths.length === 0}
        leftIcon={<CheckSquare aria-hidden="true" className="size-4" />}
      >
        Select all
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleDeselectAll}
        disabled={noneSelected}
        leftIcon={<Square aria-hidden="true" className="size-4" />}
      >
        Deselect all
      </Button>
    </div>
  );
};

SelectAllControls.displayName = 'SelectAllControls';
