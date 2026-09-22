import { cva, type VariantProps } from 'class-variance-authority';
import { Check, X } from 'lucide-react';
import { memo } from 'react';
import type { FlagStatus, Placement } from '../../types/judging';
import { PLACEMENTS } from '../../types/judging';
import { cn } from '../ui/cn';

const voteButtonVariants = cva(
  'flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  {
    variants: {
      size: {
        compact: 'size-6 text-tiny',
        normal: 'size-7 text-xs',
        large: 'h-8 min-w-8 px-2.5 text-sm',
      },
      idle: {
        true: 'bg-surface-hover text-muted-foreground backdrop-blur-sm hover:bg-foreground/20 hover:text-foreground',
        false: '',
      },
    },
    defaultVariants: { size: 'normal', idle: true },
  }
);

const dividerVariants = cva('mx-1 w-px bg-border-strong', {
  variants: {
    size: { compact: 'h-4', normal: 'h-5', large: 'h-6' },
  },
  defaultVariants: { size: 'normal' },
});

const FLAGS = [
  {
    status: 'shortlisted',
    label: 'Seleziona',
    Icon: Check,
    active: 'bg-success text-success-foreground',
  },
  {
    status: 'rejected',
    label: 'Scarta',
    Icon: X,
    active: 'bg-destructive text-destructive-foreground',
  },
] as const;

type VotingToolbarProps = VariantProps<typeof dividerVariants> & {
  flagStatus: FlagStatus;
  placement: Placement;
  onFlag: (status: FlagStatus) => void;
  onPlace: (placement: Placement) => void;
};

export const VotingToolbar = memo(function VotingToolbar({
  flagStatus,
  placement,
  onFlag,
  onPlace,
  size = 'normal',
}: VotingToolbarProps) {
  const iconSize = size === 'compact' ? 'size-3.5' : 'size-4';
  const showLabels = size === 'large';

  return (
    <div className="flex flex-wrap items-center justify-center gap-1">
      {FLAGS.map(({ status, label, Icon, active }) => {
        const isActive = flagStatus === status;
        return (
          <button
            key={status}
            type="button"
            onClick={e => {
              e.stopPropagation();
              onFlag(status);
            }}
            aria-pressed={isActive}
            aria-label={label}
            title={label}
            className={cn(
              voteButtonVariants({ size, idle: !isActive }),
              isActive && active
            )}
          >
            <Icon className={iconSize} />
            {showLabels && label}
          </button>
        );
      })}

      <div className={dividerVariants({ size })} />

      {PLACEMENTS.map(p => {
        const isActive = placement === p.value;
        return (
          <button
            key={p.value}
            type="button"
            onClick={e => {
              e.stopPropagation();
              onPlace(p.value);
            }}
            aria-pressed={isActive}
            aria-label={`Posizione ${p.label}`}
            className={cn(
              voteButtonVariants({ size, idle: !isActive }),
              'font-semibold',
              isActive && p.color
            )}
          >
            {p.label}
          </button>
        );
      })}

      {placement && (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onPlace(null);
          }}
          aria-label="Rimuovi posizione"
          title="Rimuovi posizione"
          className={voteButtonVariants({ size })}
        >
          <X className={iconSize} />
        </button>
      )}
    </div>
  );
});
