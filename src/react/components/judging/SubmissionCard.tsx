import { memo, useCallback, useState } from 'react';
import type {
  FlagStatus,
  JudgingSubmission,
  Placement,
} from '../../types/judging';
import { getImageUrl } from '../../utils/imageUtils';
import { StatusBadges } from './StatusBadges';
import { VotingToolbar } from './VotingToolbar';

type SubmissionCardProps = {
  submission: JudgingSubmission;
  size?: 'normal' | 'large';
  onInspect: (id: string) => void;
  onFlag: (submissionId: string, status: FlagStatus) => void;
  onPlace: (submissionId: string, placement: Placement) => void;
};

export const SubmissionCard = memo(function SubmissionCard({
  submission,
  size = 'normal',
  onInspect,
  onFlag,
  onPlace,
}: SubmissionCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const imageUrl = submission.r2ImageId
    ? getImageUrl(submission.r2ImageId)
    : null;
  const isRejected = submission.flagStatus === 'rejected';

  const handleClick = useCallback(() => {
    if (imageUrl) onInspect(submission.id);
  }, [imageUrl, onInspect, submission.id]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (imageUrl) onInspect(submission.id);
      }
    },
    [imageUrl, onInspect, submission.id]
  );

  const handleFlag = useCallback(
    (status: FlagStatus) => onFlag(submission.id, status),
    [onFlag, submission.id]
  );

  const handlePlace = useCallback(
    (placement: Placement) => onPlace(submission.id, placement),
    [onPlace, submission.id]
  );

  return (
    <div
      className={`relative rounded-lg overflow-hidden bg-slate-900 border-2 transition-all group ${
        isRejected
          ? 'border-red-500/50 opacity-50'
          : submission.flagStatus === 'shortlisted'
            ? 'border-emerald-500/50'
            : submission.placement
              ? 'border-yellow-500/50'
              : 'border-slate-800 hover:border-slate-600'
      }`}
    >
      <div
        role="button"
        tabIndex={0}
        className={`${size === 'large' ? 'aspect-[4/3]' : 'aspect-square'} bg-neutral-600 relative cursor-pointer`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {imageUrl && !imgFailed ? (
          <img
            src={imageUrl}
            alt={submission.title}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            onError={() => setImgFailed(true)}
          />
        ) : imgFailed ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-red-950/50 gap-2">
            <span className="text-3xl">&#9888;&#65039;</span>
            <span className="text-xs text-red-400 font-medium">
              Errore caricamento
            </span>
            <span className="text-[10px] text-red-500/70">
              #{submission.id.slice(0, 6)}
            </span>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
            <span className="text-3xl">&#128444;&#65039;</span>
            <span className="text-xs">Nessuna immagine</span>
          </div>
        )}

        <StatusBadges
          placement={submission.placement}
          flagStatus={submission.flagStatus}
        />

        {/* Hover toolbar */}
        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <VotingToolbar
            flagStatus={submission.flagStatus}
            placement={submission.placement}
            onFlag={handleFlag}
            onPlace={handlePlace}
            size="compact"
          />
        </div>
      </div>

      <div className="px-2 py-1.5 bg-slate-900">
        <p className="text-xs text-slate-300 truncate">{submission.title}</p>
      </div>
    </div>
  );
});
