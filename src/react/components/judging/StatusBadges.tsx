import { Check, X } from 'lucide-react';
import { memo } from 'react';
import type { FlagStatus, Placement } from '../../types/judging';
import { getPlacementInfo } from '../../types/judging';
import { cn } from '../ui/cn';

type StatusBadgesProps = {
  placement: Placement;
  flagStatus: FlagStatus;
  size?: 'small' | 'normal';
};

const BADGE =
  'flex items-center justify-center rounded-full text-tiny font-semibold shadow-md';

export const StatusBadges = memo(function StatusBadges({
  placement,
  flagStatus,
  size = 'normal',
}: StatusBadgesProps) {
  const badgeSize = size === 'small' ? 'size-5' : 'size-6';
  const iconSize = size === 'small' ? 'size-3' : 'size-3.5';
  const placementInfo = getPlacementInfo(placement);

  return (
    <div className="pointer-events-none absolute top-2 left-2 flex gap-1">
      {placement && placementInfo && (
        <span className={cn(BADGE, badgeSize, placementInfo.color)}>
          {placementInfo.label}
        </span>
      )}
      {flagStatus === 'shortlisted' && (
        <span
          className={cn(BADGE, badgeSize, 'bg-success text-success-foreground')}
        >
          <Check className={iconSize} />
          <span className="sr-only">Selezionato</span>
        </span>
      )}
      {flagStatus === 'rejected' && (
        <span
          className={cn(
            BADGE,
            badgeSize,
            'bg-destructive text-destructive-foreground'
          )}
        >
          <X className={iconSize} />
          <span className="sr-only">Scartato</span>
        </span>
      )}
    </div>
  );
});
