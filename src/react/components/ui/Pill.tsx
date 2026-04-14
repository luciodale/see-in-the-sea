import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from './cn';

const pillVariants = cva(
  'inline-flex items-center px-4 py-1.5 rounded-full uppercase text-editorial transition-all duration-300 whitespace-nowrap',
  {
    variants: {
      active: {
        true: 'bg-accent text-accent-foreground border border-accent',
        false:
          'bg-surface text-muted-foreground border border-border hover:text-foreground hover:bg-surface-hover hover:border-border-strong',
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

type PillProps = ComponentProps<'a'> & VariantProps<typeof pillVariants>;

export function Pill({ className, active, children, ...props }: PillProps) {
  return (
    <a
      className={cn(pillVariants({ active }), 'tracking-editorial', className)}
      {...props}
    >
      {children}
    </a>
  );
}
