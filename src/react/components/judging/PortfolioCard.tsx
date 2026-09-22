import { Images } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { PHOTO_TYPES } from '../../../constants';
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

type PortfolioCardProps = {
  portfolioId: string;
  submissions: JudgingSubmission[];
  showImages?: boolean;
  // When set, each photo opens zoomed and the card itself is not clickable
  onOpenPhoto?: (portfolioId: string, photoId: string) => void;
  onInspect: (id: string) => void;
  onFlag: (submissionIds: string[], status: FlagStatus) => void;
  onPlace: (
    submissionIds: string[],
    placement: Placement,
    categoryId: string
  ) => void;
};

export const PortfolioCard = memo(function PortfolioCard({
  portfolioId,
  submissions: portfolioSubmissions,
  showImages = false,
  onOpenPhoto,
  onInspect,
  onFlag,
  onPlace,
}: PortfolioCardProps) {
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());

  const firstPhoto = portfolioSubmissions[0];
  const submissionIds = portfolioSubmissions.map(s => s.id);

  const handleFlag = useCallback(
    (status: FlagStatus) => onFlag(submissionIds, status),
    [onFlag, submissionIds]
  );

  const handlePlace = useCallback(
    (placement: Placement) =>
      onPlace(submissionIds, placement, firstPhoto?.categoryId ?? ''),
    [onPlace, submissionIds, firstPhoto?.categoryId]
  );

  if (!firstPhoto) return null;

  const isRejected = firstPhoto.flagStatus === 'rejected';
  const isShortlisted = firstPhoto.flagStatus === 'shortlisted';
  const isIncomplete = portfolioSubmissions.length < PHOTO_TYPES.length;
  const photoCount = portfolioSubmissions.length;
  const photoByType = new Map(
    portfolioSubmissions.map(s => [s.portfolioPhotoType, s])
  );

  const handleClick = () => onInspect(portfolioId);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ignore keys bubbling up from the voting toolbar buttons
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onInspect(portfolioId);
    }
  };

  const cardClassName = cn(
    'group relative overflow-hidden rounded-lg border bg-surface outline-none transition focus-visible:ring-2 focus-visible:ring-ring',
    isRejected
      ? 'border-destructive/40 opacity-40'
      : isIncomplete
        ? 'border-warning/50'
        : isShortlisted
          ? 'border-success/50'
          : firstPhoto.placement
            ? 'border-gold/50'
            : 'border-border hover:border-border-strong'
  );

  const content = (
    <>
      {showImages ? (
        <div className="grid grid-cols-3 gap-0.5 p-0.5">
          {PHOTO_TYPES.map(photoType => {
            const sub = photoByType.get(photoType);
            const imageUrl = sub?.r2ImageId ? getImageUrl(sub.r2ImageId) : null;
            const hasFailed = sub ? failedIds.has(sub.id) : false;

            return (
              <div
                key={photoType}
                className={cn(
                  'relative aspect-4/3',
                  sub ? 'bg-surface-raised' : 'bg-surface'
                )}
              >
                {sub && imageUrl && !hasFailed && onOpenPhoto ? (
                  <button
                    type="button"
                    onClick={() => onOpenPhoto(portfolioId, sub.id)}
                    aria-label={`Ingrandisci ${photoType}`}
                    className="absolute inset-0 cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                  >
                    <img
                      src={imageUrl}
                      alt={sub.title}
                      className="size-full object-cover"
                      loading="lazy"
                      decoding="async"
                      onError={() =>
                        setFailedIds(prev => new Set(prev).add(sub.id))
                      }
                    />
                  </button>
                ) : sub && imageUrl && !hasFailed ? (
                  <img
                    src={imageUrl}
                    alt={sub.title}
                    className="size-full object-cover"
                    loading="lazy"
                    decoding="async"
                    onError={() =>
                      setFailedIds(prev => new Set(prev).add(sub.id))
                    }
                  />
                ) : hasFailed ? (
                  <ImageFallback variant="failed" compact />
                ) : (
                  <ImageFallback
                    variant="missing"
                    compact
                    className="bg-surface"
                  />
                )}
                <span className="pointer-events-none absolute bottom-1 left-1 rounded bg-background/70 px-1 py-0.5 text-tiny uppercase text-muted-foreground backdrop-blur-sm">
                  {photoType.charAt(0)}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex aspect-4/3 flex-col items-center justify-center gap-2 p-4">
          <Images className="size-8 text-subtle-foreground" />
          <span
            className={cn(
              'text-sm font-medium',
              isIncomplete ? 'text-warning' : 'text-foreground'
            )}
          >
            {photoCount}/{PHOTO_TYPES.length} foto
          </span>
          <div className="flex gap-1">
            {PHOTO_TYPES.map(type => (
              <span
                key={type}
                className={cn(
                  'rounded px-1.5 py-0.5 text-tiny uppercase',
                  photoByType.has(type)
                    ? 'bg-surface-raised text-foreground'
                    : 'bg-surface text-subtle-foreground'
                )}
              >
                {type.charAt(0)}
              </span>
            ))}
          </div>
        </div>
      )}

      <StatusBadges
        placement={firstPhoto.placement}
        flagStatus={firstPhoto.flagStatus}
        size="small"
      />

      {/* Only the toolbar catches the pointer, so the photos under the
          gradient stay clickable */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-background/90 via-background/60 to-transparent p-2 opacity-0 transition-opacity group-focus-visible:opacity-100 group-has-focus-visible:opacity-100 group-hover:opacity-100">
        <div className="pointer-events-auto mx-auto w-fit">
          <VotingToolbar
            flagStatus={firstPhoto.flagStatus}
            placement={firstPhoto.placement}
            onFlag={handleFlag}
            onPlace={handlePlace}
          />
        </div>
      </div>

      <p className="px-2 py-1.5 text-center text-xs text-muted-foreground">
        Portfolio
      </p>
    </>
  );

  // Winners grid: each photo opens zoomed, so the card itself is not a button
  if (onOpenPhoto) {
    return <div className={cardClassName}>{content}</div>;
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: card acts as button with complex inner content
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(cardClassName, 'cursor-pointer')}
    >
      {content}
    </div>
  );
});
