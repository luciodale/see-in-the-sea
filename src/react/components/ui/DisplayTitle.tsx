import type { ComponentProps, ElementType } from 'react';
import { cn } from './cn';

type DisplayTitleProps = ComponentProps<'h1'> & {
  as?: ElementType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
};

const SIZE_CLASSES = {
  sm: 'text-3xl sm:text-4xl',
  md: 'text-4xl sm:text-5xl',
  lg: 'text-5xl sm:text-6xl',
  xl: 'text-6xl sm:text-7xl lg:text-8xl',
};

export function DisplayTitle({
  as: Tag = 'h1',
  size = 'md',
  className,
  children,
  ...props
}: DisplayTitleProps) {
  return (
    <Tag
      className={cn(
        'font-serif text-foreground leading-display tracking-display',
        SIZE_CLASSES[size],
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
