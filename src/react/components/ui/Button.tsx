import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from './cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full uppercase tracking-editorial font-medium transition-all duration-300 cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  {
    variants: {
      variant: {
        primary:
          'bg-foreground text-background border border-foreground hover:bg-white hover:border-white disabled:bg-surface-raised disabled:text-subtle-foreground disabled:border-border',
        outline:
          'bg-surface-raised text-foreground border border-border-strong hover:bg-surface-hover hover:border-foreground/40 disabled:bg-surface disabled:text-subtle-foreground disabled:border-border',
        ghost:
          'bg-transparent text-muted-foreground border border-transparent hover:text-foreground hover:bg-surface disabled:text-subtle-foreground',
        secondary:
          'bg-surface-raised text-foreground border border-border hover:bg-surface-hover hover:border-border-strong disabled:bg-surface disabled:text-subtle-foreground disabled:border-border',
        danger:
          'bg-destructive text-destructive-foreground border border-destructive hover:opacity-90 disabled:bg-surface-raised disabled:text-subtle-foreground disabled:border-border',
        success:
          'bg-success text-success-foreground border border-success hover:opacity-90 disabled:bg-surface-raised disabled:text-subtle-foreground disabled:border-border',
      },
      size: {
        sm: 'px-4 py-1.5 text-tiny',
        md: 'px-5 py-2 text-editorial',
        lg: 'px-7 py-3 text-xs tracking-editorial-wide',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  fullWidth,
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
      )}
      {children}
    </button>
  );
}

export { buttonVariants };
