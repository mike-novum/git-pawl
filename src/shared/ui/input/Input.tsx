import { forwardRef } from 'react';
import type { FC } from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/shared/lib/theme/cn';

import type { InputProps } from './types';

export const inputVariants = cva(
  'w-full rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-5 text-base'
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
);

export const Input: FC<InputProps> = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, size, leftIcon, rightIcon, wrapperClassName, disabled, ...props },
    ref
  ) => {
    if (!leftIcon && !rightIcon) {
      return (
        <input
          ref={ref}
          disabled={disabled}
          className={cn(inputVariants({ size }), className)}
          {...props}
        />
      );
    }

    const iconSizeClass = size === 'lg' ? 'size-5' : size === 'sm' ? 'size-3.5' : 'size-4';

    return (
      <div className={cn('relative inline-flex w-full items-center', wrapperClassName)}>
        {leftIcon && (
          <span
            className={cn(
              'pointer-events-none absolute left-3 flex text-muted-foreground [&_svg]:size-4',
              size === 'lg' && '[&_svg]:size-5',
              size === 'sm' && '[&_svg]:size-3.5 left-2.5'
            )}
            aria-hidden="true"
          >
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          disabled={disabled}
          className={cn(
            inputVariants({ size }),
            leftIcon && (size === 'lg' ? 'pl-11' : size === 'sm' ? 'pl-8' : 'pl-9'),
            rightIcon && (size === 'lg' ? 'pr-11' : size === 'sm' ? 'pr-8' : 'pr-9'),
            className
          )}
          {...props}
        />
        {rightIcon && (
          <span
            className={cn(
              'pointer-events-none absolute right-3 flex text-muted-foreground',
              iconSizeClass && `[&_svg]:${iconSizeClass}`,
              size === 'lg' && 'right-4 [&_svg]:size-5',
              size === 'sm' && 'right-2.5 [&_svg]:size-3.5'
            )}
            aria-hidden="true"
          >
            {rightIcon}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
