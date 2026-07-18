import type { ReactNode } from 'react';

export type AppHeaderVariant = 'home' | 'workspace';

export type AppHeaderProps = {
  variant: AppHeaderVariant;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
};
