import type { FC } from 'react';

import { cn } from '@/shared/lib/theme';

import type {
  CardContentProps,
  CardDescriptionProps,
  CardFooterProps,
  CardHeaderProps,
  CardRootProps,
  CardTitleProps
} from './types';

const Card: FC<CardRootProps> = ({ as: Component = 'div', className, ...props }) => (
  <Component
    className={cn(
      'bg-card text-card-foreground rounded-lg border shadow-sm',
      className
    )}
    {...props}
  />
);

const CardHeader: FC<CardHeaderProps> = ({ className, ...props }) => (
  <div className={cn('flex flex-col gap-1.5 p-6', className)} {...props} />
);

const CardTitle: FC<CardTitleProps> = ({ className, ...props }) => (
  <h3
    className={cn('text-lg leading-none font-semibold tracking-tight', className)}
    {...props}
  />
);

const CardDescription: FC<CardDescriptionProps> = ({ className, ...props }) => (
  <p className={cn('text-muted-foreground text-sm', className)} {...props} />
);

const CardContent: FC<CardContentProps> = ({ className, ...props }) => (
  <div className={cn('p-6 pt-0', className)} {...props} />
);

const CardFooter: FC<CardFooterProps> = ({ className, ...props }) => (
  <div className={cn('flex items-center p-6 pt-0', className)} {...props} />
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
