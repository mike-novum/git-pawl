import type { ComponentProps, ReactElement, ReactNode } from 'react';

import type { Tooltip } from '@base-ui/react/tooltip';

export type TooltipRootProps = ComponentProps<typeof Tooltip.Root>;
export type TooltipTriggerProps = ComponentProps<typeof Tooltip.Trigger>;
export type TooltipPortalProps = ComponentProps<typeof Tooltip.Portal>;
export type TooltipPositionerProps = ComponentProps<typeof Tooltip.Positioner>;
export type TooltipPopupProps = ComponentProps<typeof Tooltip.Popup>;
export type TooltipArrowProps = ComponentProps<typeof Tooltip.Arrow>;

export type TooltipContentProps = {
  children: ReactNode;
  arrow?: boolean;
  className?: string;
};

export type TooltipSide = 'top' | 'right' | 'bottom' | 'left';
export type TooltipAlign = 'start' | 'center' | 'end';

export type TooltipProps = {
  content: ReactNode;
  children: ReactElement;
  delay?: number;
  closeDelay?: number;
  side?: TooltipSide;
  align?: TooltipAlign;
  className?: string;
};
