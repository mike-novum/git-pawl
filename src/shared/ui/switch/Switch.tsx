import { Switch as BaseSwitch } from '@base-ui/react/switch';
import type { FC } from 'react';

import { cn } from '@/shared/lib/theme';

import type { SwitchRootProps, SwitchThumbProps } from './types';

const Root: FC<SwitchRootProps> = ({ className, ...rest }) => (
  <BaseSwitch.Root
    className={cn(
      'group/switch bg-muted data-[checked]:bg-primary focus-visible:ring-ring relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...rest}
  />
);

const Thumb: FC<SwitchThumbProps> = ({ className, ...rest }) => (
  <BaseSwitch.Thumb
    className={cn(
      'bg-background pointer-events-none block size-4 rounded-full shadow-sm transition-transform group-data-[checked]/switch:translate-x-4 group-data-[unchecked]/switch:translate-x-0.5',
      className
    )}
    {...rest}
  />
);

const Switch = { Root, Thumb };

export { Switch, Root, Thumb };
