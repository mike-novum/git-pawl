import type { HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import type { VariantProps } from 'class-variance-authority';

import type { inputVariants } from './Input';

export type InputSize = NonNullable<VariantProps<typeof inputVariants>['size']>;

type InputVariantProps = Omit<VariantProps<typeof inputVariants>, 'size'> & {
  size?: InputSize;
};

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> &
  InputVariantProps & {
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    wrapperClassName?: string;
  };

export type InputDomProps = HTMLAttributes<HTMLInputElement>;

