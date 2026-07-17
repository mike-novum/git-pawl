import type { Menu as MenuPrimitive } from '@base-ui/react/menu';
import type { ComponentPropsWithoutRef } from 'react';

type RootProps = ComponentPropsWithoutRef<typeof MenuPrimitive.Root>;
type TriggerProps = ComponentPropsWithoutRef<typeof MenuPrimitive.Trigger>;
type PortalProps = ComponentPropsWithoutRef<typeof MenuPrimitive.Portal>;
type PositionerProps = ComponentPropsWithoutRef<typeof MenuPrimitive.Positioner>;
type PopupProps = ComponentPropsWithoutRef<typeof MenuPrimitive.Popup>;
type ItemProps = ComponentPropsWithoutRef<typeof MenuPrimitive.Item>;
type GroupProps = ComponentPropsWithoutRef<typeof MenuPrimitive.Group>;
type GroupLabelProps = ComponentPropsWithoutRef<typeof MenuPrimitive.GroupLabel>;
type SubmenuTriggerProps = ComponentPropsWithoutRef<typeof MenuPrimitive.SubmenuTrigger>;
type RadioItemProps = ComponentPropsWithoutRef<typeof MenuPrimitive.RadioItem>;
type RadioGroupProps = ComponentPropsWithoutRef<typeof MenuPrimitive.RadioGroup>;
type CheckboxItemProps = ComponentPropsWithoutRef<typeof MenuPrimitive.CheckboxItem>;
type CheckboxItemIndicatorProps = ComponentPropsWithoutRef<
  typeof MenuPrimitive.CheckboxItemIndicator
>;

export type DropdownMenuRootProps = Omit<RootProps, 'className'> & {
  className?: string;
};

export type DropdownMenuTriggerProps = Omit<TriggerProps, 'className'> & {
  className?: string;
};

export type DropdownMenuPortalProps = Omit<PortalProps, 'className'> & {
  className?: string;
};

export type DropdownMenuPositionerProps = Omit<PositionerProps, 'className'> & {
  className?: string;
};

export type DropdownMenuContentProps = Omit<PopupProps, 'className'> & {
  className?: string;
};

export type DropdownMenuItemProps = Omit<ItemProps, 'className'> & {
  className?: string;
};

export type DropdownMenuGroupProps = Omit<GroupProps, 'className'> & {
  className?: string;
};

export type DropdownMenuLabelProps = Omit<GroupLabelProps, 'className'> & {
  className?: string;
};

export type DropdownMenuSubmenuTriggerProps = Omit<SubmenuTriggerProps, 'className'> & {
  className?: string;
};

export type DropdownMenuRadioGroupProps = Omit<RadioGroupProps, 'className'> & {
  className?: string;
};

export type DropdownMenuRadioItemProps = Omit<RadioItemProps, 'className'> & {
  className?: string;
};

export type DropdownMenuCheckboxItemProps = Omit<CheckboxItemProps, 'className'> & {
  className?: string;
};

export type DropdownMenuCheckboxItemIndicatorProps = Omit<
  CheckboxItemIndicatorProps,
  'className'
> & {
  className?: string;
};
