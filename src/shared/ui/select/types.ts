import type { ComponentProps, ReactNode } from 'react';

import type { Select } from '@base-ui/react/select';

export type SelectRootProps = ComponentProps<typeof Select.Root>;
export type SelectTriggerProps = ComponentProps<typeof Select.Trigger>;
export type SelectValueProps = ComponentProps<typeof Select.Value>;
export type SelectPortalProps = ComponentProps<typeof Select.Portal>;
export type SelectPositionerProps = ComponentProps<typeof Select.Positioner>;
export type SelectPopupProps = ComponentProps<typeof Select.Popup>;
export type SelectListProps = ComponentProps<typeof Select.List>;
export type SelectItemProps = ComponentProps<typeof Select.Item>;
export type SelectItemTextProps = ComponentProps<typeof Select.ItemText>;
export type SelectItemIndicatorProps = ComponentProps<typeof Select.ItemIndicator>;
export type SelectArrowProps = ComponentProps<typeof Select.Arrow>;

export type SelectOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

export type SelectProps = {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  popupClassName?: string;
};
