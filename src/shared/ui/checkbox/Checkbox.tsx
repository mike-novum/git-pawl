import { Check } from 'lucide-react';
import type { FC } from 'react';

import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';

import { cn } from '@/shared/lib/theme/cn';

import type { CheckboxProps } from './types';

export const Checkbox: FC<CheckboxProps> = ({
  label,
  className,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  indeterminate,
  ...props
}) => {
  const root = (
    <BaseCheckbox.Root
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      indeterminate={indeterminate}
      className={cn(
        'peer relative inline-flex size-5 shrink-0 items-center justify-center rounded-sm border border-border bg-background outline-none transition-colors',
        'hover:border-primary/70',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'data-[checked]:border-primary data-[checked]:bg-primary data-[checked]:text-primary-foreground',
        'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
        'data-[indeterminate]:border-primary data-[indeterminate]:bg-primary data-[indeterminate]:text-primary-foreground',
        className
      )}
      {...props}
    >
      <BaseCheckbox.Indicator className="flex items-center justify-center text-current">
        <Check className="size-3.5" strokeWidth={3} />
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );

  if (!label) {
    return root;
  }

  return (
    <label
      className={cn(
        'inline-flex items-center gap-2 text-sm text-foreground select-none',
        disabled && 'cursor-not-allowed opacity-50'
      )}
    >
      {root}
      <span>{label}</span>
    </label>
  );
};

Checkbox.displayName = 'Checkbox';
