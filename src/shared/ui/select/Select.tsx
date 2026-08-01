import type { FC, ReactNode } from 'react';
import { Check, ChevronDown } from 'lucide-react';

import { Select as BaseSelect } from '@base-ui/react/select';

import { cn } from '@/shared/lib/theme/cn';
import { Z_POPUP } from '@/shared/lib/theme';

import type { SelectProps } from './types';

export const Root = BaseSelect.Root;
export const Value = BaseSelect.Value;
export const Group = BaseSelect.Group;
export const GroupLabel = BaseSelect.GroupLabel;
export const Portal = BaseSelect.Portal;

export const Trigger: FC<{
  className?: string;
  placeholder?: string;
  children?: ReactNode;
}> = ({ className, placeholder, children }) => (
  <BaseSelect.Trigger
    className={cn(
      'inline-flex h-10 w-full items-center justify-between gap-2 rounded-md border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors',
      'focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
      'data-[placeholder]:text-muted-foreground',
      className
    )}
  >
    {children ?? <BaseSelect.Value placeholder={placeholder} />}
    <BaseSelect.Icon className="text-muted-foreground">
      <ChevronDown className="size-4" />
    </BaseSelect.Icon>
  </BaseSelect.Trigger>
);

Trigger.displayName = 'Select.Trigger';

export const Positioner: FC<{ children: ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <BaseSelect.Positioner sideOffset={6} className={cn(Z_POPUP, 'outline-none', className)}>
    {children}
  </BaseSelect.Positioner>
);

Positioner.displayName = 'Select.Positioner';

export const Popup: FC<{ children: ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <BaseSelect.Popup
    className={cn(
      'max-h-64 min-w-[var(--anchor-width)] overflow-hidden rounded-md border border-border bg-background text-foreground shadow-md',
      'transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-fast)]',
      'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0',
      className
    )}
  >
    {children}
  </BaseSelect.Popup>
);

Popup.displayName = 'Select.Popup';

export const List: FC<{ children: ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <BaseSelect.List className={cn('max-h-64 overflow-y-auto p-1', className)}>
    {children}
  </BaseSelect.List>
);

List.displayName = 'Select.List';

export const Item: FC<{
  value: string;
  label: string;
  disabled?: boolean;
  className?: string;
}> = ({ value, label, disabled, className }) => (
  <BaseSelect.Item
    value={value}
    disabled={disabled}
    className={cn(
      'flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none',
      'data-[highlighted]:bg-muted data-[highlighted]:text-foreground',
      'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
      className
    )}
  >
    <BaseSelect.ItemIndicator className="flex size-4 items-center justify-center text-primary">
      <Check className="size-3.5" />
    </BaseSelect.ItemIndicator>
    <BaseSelect.ItemText>{label}</BaseSelect.ItemText>
  </BaseSelect.Item>
);

Item.displayName = 'Select.Item';

export const Arrow: FC<{ className?: string }> = ({ className }) => (
  <BaseSelect.Arrow
    className={cn(
      'fill-background drop-shadow-sm',
      '[&>svg]:fill-background [&>svg]:stroke-border [&>svg]:[stroke-width:1]',
      className
    )}
  />
);

Arrow.displayName = 'Select.Arrow';

export const Select: FC<SelectProps> = ({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  disabled,
  className,
  triggerClassName,
  popupClassName
}) => (
  <div className={className}>
    <BaseSelect.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={(next) => onValueChange?.(next)}
      disabled={disabled}
    >
      <Trigger placeholder={placeholder} className={triggerClassName} />
      <Portal>
        <Positioner>
          <Popup className={popupClassName}>
            <List>
              {options.map((option) => (
                <Item
                  key={option.value}
                  value={option.value}
                  label={typeof option.label === 'string' ? option.label : String(option.value)}
                  disabled={option.disabled}
                />
              ))}
            </List>
            <Arrow />
          </Popup>
        </Positioner>
      </Portal>
    </BaseSelect.Root>
  </div>
);

Select.displayName = 'Select';
