import type { FC, ReactNode } from 'react';

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';

import { cn } from '@/shared/lib/theme/cn';

import type {
  TooltipProps,
  TooltipPortalProps,
  TooltipPositionerProps,
  TooltipPopupProps,
  TooltipArrowProps
} from './types';

export const Root = BaseTooltip.Root;
export const Trigger = BaseTooltip.Trigger;
export const Portal: FC<TooltipPortalProps> = (props) => <BaseTooltip.Portal {...props} />;

Portal.displayName = 'Tooltip.Portal';

export const Positioner: FC<TooltipPositionerProps> = (props) => (
  <BaseTooltip.Positioner sideOffset={6} {...props} />
);

Positioner.displayName = 'Tooltip.Positioner';

export const Popup: FC<TooltipPopupProps> = ({ className, ...props }) => (
  <BaseTooltip.Popup
    className={cn(
      'z-50 max-w-xs rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground shadow-md',
      'transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-fast)]',
      'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0',
      className
    )}
    {...props}
  />
);

Popup.displayName = 'Tooltip.Popup';

export const Arrow: FC<TooltipArrowProps> = ({ className, ...props }) => (
  <BaseTooltip.Arrow
    className={cn(
      'fill-background drop-shadow-sm',
      '[&>svg]:fill-background [&>svg]:stroke-border [&>svg]:[stroke-width:1]',
      className
    )}
    {...props}
  />
);

Arrow.displayName = 'Tooltip.Arrow';

export const Content: FC<{
  children: ReactNode;
  arrow?: boolean;
  className?: string;
}> = ({ children, arrow = true, className }) => (
  <Portal>
    <Positioner>
      <Popup className={className}>
        {children}
        {arrow && <Arrow />}
      </Popup>
    </Positioner>
  </Portal>
);

Content.displayName = 'Tooltip.Content';

export const Tooltip: FC<TooltipProps> = ({
  content,
  children,
  delay = 400,
  closeDelay = 0,
  side = 'top',
  align = 'center',
  className
}) => (
  <BaseTooltip.Root>
    <BaseTooltip.Trigger delay={delay} closeDelay={closeDelay} render={children} />
    <Portal>
      <Positioner side={side} align={align}>
        <Popup className={className}>
          {content}
          <Arrow />
        </Popup>
      </Positioner>
    </Portal>
  </BaseTooltip.Root>
);

Tooltip.displayName = 'Tooltip';

export const Provider: FC<{ children: ReactNode; delay?: number; closeDelay?: number }> = ({
  children,
  delay,
  closeDelay
}) => (
  <BaseTooltip.Provider delay={delay} closeDelay={closeDelay}>
    {children}
  </BaseTooltip.Provider>
);

Provider.displayName = 'Tooltip.Provider';
