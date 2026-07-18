import type { ReactNode } from 'react';

export type DrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  width?: number;
  children: ReactNode;
  footer?: ReactNode;
};
