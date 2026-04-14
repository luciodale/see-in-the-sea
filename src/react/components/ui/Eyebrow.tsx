import type { ComponentProps } from 'react';
import { cn } from './cn';

type EyebrowProps = ComponentProps<'p'>;

export function Eyebrow({ className, children, ...props }: EyebrowProps) {
  return (
    <p
      className={cn(
        'text-editorial uppercase text-muted-foreground tracking-editorial-wider m-0',
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}
