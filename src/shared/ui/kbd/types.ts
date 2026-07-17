import type { ComponentPropsWithoutRef } from 'react';

export type KbdKey = string;

export type KbdProps = ComponentPropsWithoutRef<'kbd'> & {
  keys?: KbdKey[];
};
