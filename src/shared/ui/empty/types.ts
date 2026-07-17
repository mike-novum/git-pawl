import type { ReactNode } from 'react';

export type EmptyProps = {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};
