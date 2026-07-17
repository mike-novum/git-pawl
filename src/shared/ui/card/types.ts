import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

type DivProps = ComponentPropsWithoutRef<'div'>;

export type CardRootProps = DivProps & {
  as?: ElementType;
  children?: ReactNode;
};

export type CardHeaderProps = DivProps;

export type CardTitleProps = ComponentPropsWithoutRef<'h3'>;

export type CardDescriptionProps = ComponentPropsWithoutRef<'p'>;

export type CardContentProps = DivProps;

export type CardFooterProps = DivProps;
