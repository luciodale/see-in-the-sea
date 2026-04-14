import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from './cn';

const cardVariants = cva('rounded-xl border p-6', {
  variants: {
    variant: {
      default: 'bg-surface border-border',
      raised: 'bg-surface-raised border-border-strong',
      info: 'bg-accent-muted border-accent/30',
      success: 'bg-success/10 border-success/30',
      warning: 'bg-warning/10 border-warning/30',
      danger: 'bg-destructive/10 border-destructive/30',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type CardProps = ComponentProps<'div'> & VariantProps<typeof cardVariants>;

export function Card({ className, variant, children, ...props }: CardProps) {
  return (
    <div className={cn(cardVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
}
