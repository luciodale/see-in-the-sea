import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from './cn';

const panelVariants = cva(
  'backdrop-blur-xl rounded-3xl border p-8 shadow-2xl',
  {
    variants: {
      variant: {
        default: 'bg-surface/80 border-border',
        raised: 'bg-surface-raised/90 border-border-strong',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type PanelProps = ComponentProps<'div'> & VariantProps<typeof panelVariants>;

export function Panel({ className, variant, children, ...props }: PanelProps) {
  return (
    <div className={cn(panelVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
}
