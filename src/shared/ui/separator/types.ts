import type { Separator as SeparatorPrimitive } from '@base-ui/react/separator';
import type { ComponentPropsWithoutRef } from 'react';

export type SeparatorOrientation = 'horizontal' | 'vertical';

export type SeparatorProps = ComponentPropsWithoutRef<typeof SeparatorPrimitive> & {
  orientation?: SeparatorOrientation;
  className?: string;
};
