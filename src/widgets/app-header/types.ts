import type { ReactNode } from 'react';

export type AppHeaderVariant = 'home' | 'workspace' | 'repository' | 'settings';

export type AppHeaderProps = {
  variant: AppHeaderVariant;
  leftSlot?: ReactNode;
  metaSlot?: ReactNode;
  rightSlot?: ReactNode;
  hideSettings?: boolean;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onOpenCommandPalette?: () => void;
};
