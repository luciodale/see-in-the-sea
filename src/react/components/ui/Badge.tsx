import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from './cn';

const badgeVariants = cva(
  'text-xs font-medium px-2 py-0.5 rounded-full inline-flex items-center',
  {
    variants: {
      variant: {
        default: 'bg-surface-raised text-muted-foreground',
        accent: 'bg-accent text-accent-foreground',
        gold: 'bg-gold text-gold-foreground',
        success: 'bg-success/20 text-success',
        warning: 'bg-warning/20 text-warning',
        danger: 'bg-destructive/20 text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type BadgeProps = ComponentProps<'span'> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  );
}
