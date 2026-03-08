import { memo } from 'react';
import type { FlagStatus, Placement } from '../../types/judging';
import { PLACEMENTS } from '../../types/judging';

type StatusBadgesProps = {
  placement: Placement;
  flagStatus: FlagStatus;
  size?: 'small' | 'normal';
};

export const StatusBadges = memo(function StatusBadges({
  placement,
  flagStatus,
  size = 'normal',
}: StatusBadgesProps) {
  const badgeSize = size === 'small' ? 'w-6 h-6' : 'w-7 h-7';

  return (
    <div className="absolute top-2 left-2 flex gap-1.5">
      {placement && (
        <span
          className={`${PLACEMENTS.find(p => p.value === placement)?.color} ${badgeSize} rounded-full flex items-center justify-center text-xs font-bold shadow-lg`}
        >
          {PLACEMENTS.find(p => p.value === placement)?.label}
        </span>
      )}
      {flagStatus === 'shortlisted' && (
        <span
          className={`bg-emerald-500 ${badgeSize} rounded-full flex items-center justify-center text-xs shadow-lg`}
        >
          &#10003;
        </span>
      )}
      {flagStatus === 'rejected' && (
        <span
          className={`bg-red-500 ${badgeSize} rounded-full flex items-center justify-center text-xs shadow-lg`}
        >
          &#10007;
        </span>
      )}
    </div>
  );
});
