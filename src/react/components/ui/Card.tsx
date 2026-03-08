import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from './cn';

const cardVariants = cva('rounded-xl border p-6', {
  variants: {
    variant: {
      default: 'bg-slate-800/80 border-slate-700/60',
      info: 'bg-sky-950/30 border-sky-800/30',
      success:
        'bg-gradient-to-r from-emerald-950/40 to-teal-950/30 border-emerald-800/40',
      warning: 'bg-amber-950/25 border-amber-800/40',
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
