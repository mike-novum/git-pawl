import type { ReactNode } from 'react';

export type AppLayoutProps = {
  children?: ReactNode;
};

export type NavItem = {
  to: string;
  label: string;
};
