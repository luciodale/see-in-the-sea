import type { SyntheticEvent } from 'react';
import type { JudgingSubmission } from '../../types/judging';
import { formatPortfolioPhotoType } from '../../utils/adminFormat';
import { getImageUrl } from '../../utils/imageUtils';
import { cn } from '../ui/cn';
import { ImageFallback } from './ImageFallback';

type PortfolioPhotoCellProps = {
  photo: JudgingSubmission;
  hasFailed: boolean;
  className?: string;
  onOpen: (photoId: string) => void;
  onImageLoad: (
    photoId: string,
    event: SyntheticEvent<HTMLImageElement>
  ) => void;
  onImageError: (photoId: string) => void;
};

// One photo of the portfolio overview: the image is sized by its own aspect
// ratio inside the cell, so the border hugs the photo and no space is lost
// to a card frame. Its height comes from flex shrinking rather than
// max-h-full, which WebKit fails to update when the cell grows. The button can
// be wider than a height limited photo, so only the photo takes the pointer.
export function PortfolioPhotoCell({
  photo,
  hasFailed,
  className,
  onOpen,
  onImageLoad,
  onImageError,
}: PortfolioPhotoCellProps) {
  const imageUrl = photo.r2ImageId
    ? getImageUrl(photo.r2ImageId, 'thumb')
    : null;
  const hasImage = !!imageUrl && !hasFailed;
  const label = photo.portfolioPhotoType
    ? formatPortfolioPhotoType(photo.portfolioPhotoType)
    : '';

  return (
    <div
      className={cn(
        'flex min-h-0 min-w-0 flex-col items-center justify-center gap-1',
        className
      )}
    >
      <button
        type="button"
        onClick={() => onOpen(photo.id)}
        aria-label={`Ingrandisci ${label || photo.title}`}
        className={cn(
          'group flex min-h-0 max-w-full flex-col items-center justify-center focus-visible:outline-none',
          hasImage
            ? 'pointer-events-none'
            : 'flex-1 self-stretch cursor-zoom-in'
        )}
      >
        {hasImage ? (
          <img
            src={imageUrl ?? undefined}
            alt={photo.title}
            onLoad={event => onImageLoad(photo.id, event)}
            onError={() => onImageError(photo.id)}
            className="pointer-events-auto min-h-0 max-w-full border border-border-strong object-contain cursor-zoom-in group-focus-visible:ring-2 group-focus-visible:ring-ring"
          />
        ) : (
          <ImageFallback
            variant={hasFailed ? 'failed' : 'missing'}
            className="border border-border group-focus-visible:ring-2 group-focus-visible:ring-ring"
          />
        )}
      </button>
      <p className="shrink-0 text-center text-tiny uppercase tracking-editorial text-subtle-foreground">
        {label}
      </p>
    </div>
  );
}
