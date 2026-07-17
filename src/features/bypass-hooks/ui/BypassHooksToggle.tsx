import type { FC } from 'react';

import { Checkbox } from '@/shared/ui';

import type { BypassHooksToggleProps } from './types';

export const BypassHooksToggle: FC<BypassHooksToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  className
}) => {
  const handleChange = (next: boolean): void => {
    onChange(next);
  };

  return (
    <Checkbox
      label="Bypass pre-commit hooks"
      checked={checked}
      onCheckedChange={handleChange}
      disabled={disabled}
      className={className}
    />
  );
};
