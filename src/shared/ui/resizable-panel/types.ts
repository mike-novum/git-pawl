import type { HTMLAttributes, ReactNode } from 'react';
import type { GroupProps, PanelProps, SeparatorProps } from 'react-resizable-panels';

export type Orientation = 'horizontal' | 'vertical';

export type PanelGroupProps = Omit<GroupProps, 'children' | 'orientation' | 'className'> & {
  children: ReactNode;
  orientation?: Orientation;
  className?: string;
};

export type PanelItemProps = Omit<PanelProps, 'children' | 'className'> & {
  children: ReactNode;
  className?: string;
};

export type PanelHandleProps = Omit<SeparatorProps, 'children' | 'className'> & {
  children?: ReactNode;
  className?: string;
};

export type ResizablePanelRootProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};
