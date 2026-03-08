import { memo } from 'react';
import type { FlagStatus, Placement } from '../../types/judging';
import { PLACEMENTS } from '../../types/judging';

type VotingToolbarProps = {
  flagStatus: FlagStatus;
  placement: Placement;
  onFlag: (status: FlagStatus) => void;
  onPlace: (placement: Placement) => void;
  size?: 'compact' | 'normal';
};

export const VotingToolbar = memo(function VotingToolbar({
  flagStatus,
  placement,
  onFlag,
  onPlace,
  size = 'normal',
}: VotingToolbarProps) {
  const btnSize = size === 'compact' ? 'w-6 h-6 text-xs' : 'w-7 h-7 text-sm';
  const dividerH = size === 'compact' ? 'h-5' : 'h-6';
  const dividerMx = size === 'compact' ? 'mx-1' : 'mx-1.5';

  return (
    <div className="flex items-center justify-center gap-1">
      {/* Flags */}
      <button
        type="button"
        onClick={e => {
          e.stopPropagation();
          onFlag('shortlisted');
        }}
        className={`${btnSize} rounded transition-all ${
          flagStatus === 'shortlisted'
            ? 'bg-emerald-500 text-white'
            : 'bg-slate-700/80 text-emerald-400 hover:bg-emerald-600 hover:text-white'
        }`}
      >
        &#10003;
      </button>
      <button
        type="button"
        onClick={e => {
          e.stopPropagation();
          onFlag('rejected');
        }}
        className={`${btnSize} rounded transition-all ${
          flagStatus === 'rejected'
            ? 'bg-red-500 text-white'
            : 'bg-slate-700/80 text-red-400 hover:bg-red-600 hover:text-white'
        }`}
      >
        &#10007;
      </button>

      <div className={`w-px ${dividerH} bg-slate-600 ${dividerMx}`} />

      {/* Placements */}
      {PLACEMENTS.map(p => (
        <button
          key={p.value}
          type="button"
          onClick={e => {
            e.stopPropagation();
            onPlace(p.value);
          }}
          className={`${btnSize} rounded font-bold transition-all ${
            placement === p.value
              ? `${p.color} text-white scale-110`
              : 'bg-slate-700/80 text-slate-300 hover:bg-slate-600'
          }`}
        >
          {p.label}
        </button>
      ))}
      {placement && (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onPlace(null);
          }}
          className={`${btnSize} rounded bg-slate-700/80 text-slate-400 hover:bg-slate-600 hover:text-white`}
        >
          &#10005;
        </button>
      )}
    </div>
  );
});
