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
      'group/arrow flex items-center justify-center',
      'data-[side=top]:-bottom-[5px]',
      'data-[side=bottom]:-top-[5px]',
      'data-[side=left]:-right-[5px]',
      'data-[side=right]:-left-[5px]',
      className
    )}
    {...props}
  >
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      aria-hidden
      className={cn(
        'block fill-background stroke-border [stroke-width:1]',
        'group-data-[side=top]/arrow:rotate-180',
        'group-data-[side=left]/arrow:rotate-90',
        'group-data-[side=right]/arrow:-rotate-90'
      )}
    >
      <path d="M5 0 L10 10 L0 10 Z" />
    </svg>
  </BaseTooltip.Arrow>
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
