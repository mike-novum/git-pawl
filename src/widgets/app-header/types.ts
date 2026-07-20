import type { ReactNode } from 'react';

export type AppHeaderVariant = 'home' | 'workspace' | 'repository';

export type AppHeaderProps = {
  variant: AppHeaderVariant;
  leftSlot?: ReactNode;
  metaSlot?: ReactNode;
  rightSlot?: ReactNode;
  hideSettings?: boolean;
};
