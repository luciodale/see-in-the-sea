import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from './cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary:
          'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 disabled:hover:bg-emerald-600',
        secondary:
          'bg-slate-700/80 text-slate-200 hover:bg-slate-600 active:bg-slate-700 disabled:hover:bg-slate-700/80',
        danger:
          'bg-red-700/80 text-white hover:bg-red-600 active:bg-red-800 disabled:hover:bg-red-700/80',
        ghost:
          'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:hover:bg-transparent',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm rounded-lg',
        md: 'px-4 py-2 text-sm rounded-lg',
        lg: 'px-6 py-3 text-base rounded-lg',
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
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
      )}
      {children}
    </button>
  );
}

export { buttonVariants };
