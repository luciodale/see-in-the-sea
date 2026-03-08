import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from './cn';

const badgeVariants = cva('text-xs px-2 py-0.5 rounded-full', {
  variants: {
    variant: {
      default: 'bg-slate-600/60 text-slate-400',
      success: 'bg-emerald-600/80 text-emerald-100',
      warning: 'bg-amber-600/80 text-amber-100',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type BadgeProps = ComponentProps<'span'> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  );
}
