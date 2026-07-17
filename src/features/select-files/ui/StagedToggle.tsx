import type { FC } from 'react';

import { Checkbox } from '@/shared/ui';

import { useSelectedFiles } from '../model';

import type { StagedToggleProps } from './types';

export const StagedToggle: FC<StagedToggleProps> = ({
  repoPath,
  path,
  disabled = false,
  className
}) => {
  const { isSelected, toggle } = useSelectedFiles(repoPath);

  const handleChange = (next: boolean): void => {
    if (next === isSelected(path)) return;
    toggle(path);
  };

  return (
    <Checkbox
      aria-label={`Toggle ${path}`}
      checked={isSelected(path)}
      disabled={disabled}
      onCheckedChange={handleChange}
      className={className}
    />
  );
};

StagedToggle.displayName = 'StagedToggle';
