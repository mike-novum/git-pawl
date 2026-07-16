import type { ComponentProps, ReactNode } from 'react';

import type { Checkbox } from '@base-ui/react/checkbox';

type CheckboxRootProps = ComponentProps<typeof Checkbox.Root>;

export type CheckboxProps = Omit<CheckboxRootProps, 'children'> & {
  label?: ReactNode;
  className?: string;
};
