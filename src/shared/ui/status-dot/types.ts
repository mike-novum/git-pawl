import type { ComponentPropsWithoutRef } from 'react';

export type StatusDotVariant = 'clean' | 'warning' | 'danger';

export type StatusDotProps = ComponentPropsWithoutRef<'span'> & {
  variant: StatusDotVariant;
  label?: string;
};
