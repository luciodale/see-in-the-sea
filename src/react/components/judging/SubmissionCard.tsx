import { memo, useCallback, useState } from 'react';
import type { JudgingIdentity } from '../../hooks/useJudgingIdentities';
import type {
  FlagStatus,
  JudgingSubmission,
  Placement,
} from '../../types/judging';
import { getImageUrl } from '../../utils/imageUtils';
import { cn } from '../ui/cn';
import { ImageFallback } from './ImageFallback';
import { StatusBadges } from './StatusBadges';
import { VotingToolbar } from './VotingToolbar';

type SubmissionCardProps = {
  submission: JudgingSubmission;
  identity?: JudgingIdentity | null;
  size?: 'normal' | 'large';
  onInspect: (id: string) => void;
  onFlag: (submissionId: string, status: FlagStatus) => void;
  onPlace: (submissionId: string, placement: Placement) => void;
};

export const SubmissionCard = memo(function SubmissionCard({
  submission,
  identity,
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
  const isShortlisted = submission.flagStatus === 'shortlisted';

  const handleClick = useCallback(() => {
    if (imageUrl) onInspect(submission.id);
  }, [imageUrl, onInspect, submission.id]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Ignore keys bubbling up from the voting toolbar buttons
      if (e.target !== e.currentTarget) return;
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
      className={cn(
        'group relative overflow-hidden rounded-lg border bg-surface transition',
        isRejected
          ? 'border-destructive/40 opacity-40'
          : isShortlisted
            ? 'border-success/50'
            : submission.placement
              ? 'border-gold/50'
              : 'border-border hover:border-border-strong'
      )}
    >
      {/* biome-ignore lint/a11y/useSemanticElements: card acts as button with complex inner content */}
      <div
        role="button"
        tabIndex={0}
        className={cn(
          'relative bg-surface-raised outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
          size === 'large' ? 'aspect-4/3' : 'aspect-square',
          imageUrl ? 'cursor-zoom-in' : 'cursor-default'
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {imageUrl && !imgFailed ? (
          <img
            src={imageUrl}
            alt={submission.title}
            className="size-full object-cover"
            loading="lazy"
            decoding="async"
            onError={() => setImgFailed(true)}
          />
        ) : imgFailed ? (
          <ImageFallback
            variant="failed"
            detail={`#${submission.id.slice(0, 6)}`}
          />
        ) : (
          <ImageFallback variant="missing" />
        )}

        <StatusBadges
          placement={submission.placement}
          flagStatus={submission.flagStatus}
        />

        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-background/90 via-background/60 to-transparent p-2 opacity-0 transition-opacity group-has-focus-visible:opacity-100 group-hover:opacity-100">
          <VotingToolbar
            flagStatus={submission.flagStatus}
            placement={submission.placement}
            onFlag={handleFlag}
            onPlace={handlePlace}
            size="compact"
          />
        </div>
      </div>

      <div className="flex flex-col gap-0.5 px-2 py-1.5">
        <p
          className="truncate text-xs text-muted-foreground"
          title={submission.title}
        >
          {submission.title}
        </p>
        {identity && (
          <p
            className="truncate text-tiny text-subtle-foreground"
            title={identity.email}
          >
            {identity.name || identity.email}
          </p>
        )}
      </div>
    </div>
  );
});
