import type { ComponentPropsWithoutRef } from 'react';

export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success';

export type BadgeSize = 'sm' | 'md';

export type BadgeProps = ComponentPropsWithoutRef<'span'> & {
  variant?: BadgeVariant;
  size?: BadgeSize;
};
