import type { ReactNode } from 'react';
import { MEDITERRANEAN_CATEGORY_ID } from '../../../constants';
import type { AdminSubmission } from '../../../types/api';
import {
  formatAdminDate,
  formatPortfolioPhotoType,
} from '../../utils/adminFormat';
import { getImageUrl } from '../../utils/imageUtils';
import { cn } from '../ui/cn';

type ThumbnailFrameProps = {
  className?: string;
  children: ReactNode;
};

// Fixed 4:3 frame so every expanded row has the same height. The image is
// absolutely positioned because WebKit ignores the aspect-ratio height for
// percentage-sized children inside table cells.
function ThumbnailFrame({ className, children }: ThumbnailFrameProps) {
  return (
    <div
      className={cn(
        'relative aspect-4/3 w-full max-w-sm shrink-0 self-start overflow-hidden rounded-md bg-surface-raised md:w-56',
        className
      )}
    >
      {children}
    </div>
  );
}

type SubmissionThumbnailProps = {
  submission: AdminSubmission;
  onOpenImage: (submission: AdminSubmission) => void;
};

function SubmissionThumbnail({
  submission,
  onOpenImage,
}: SubmissionThumbnailProps) {
  if (!submission.r2ImageId) {
    return (
      <ThumbnailFrame className="flex items-center justify-center">
        <span className="text-xs text-subtle-foreground">Nessuna immagine</span>
      </ThumbnailFrame>
    );
  }

  return (
    <ThumbnailFrame>
      <button
        type="button"
        onClick={() => onOpenImage(submission)}
        aria-label={`Apri a schermo intero: ${submission.title}`}
        className="group absolute inset-0 cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        <img
          src={getImageUrl(submission.r2ImageId)}
          alt={submission.title}
          loading="lazy"
          className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </button>
    </ThumbnailFrame>
  );
}

type DetailItemProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

function DetailItem({ label, children, className }: DetailItemProps) {
  return (
    <div className={cn('flex min-w-0 gap-2', className)}>
      <dt className="shrink-0 text-subtle-foreground">{label}</dt>
      <dd className="min-w-0 text-foreground">{children}</dd>
    </div>
  );
}

type SubmissionDetailRowProps = {
  submission: AdminSubmission;
  onOpenImage: (submission: AdminSubmission) => void;
};

export function SubmissionDetailRow({
  submission,
  onOpenImage,
}: SubmissionDetailRowProps) {
  const isPortfolio =
    submission.categoryId === MEDITERRANEAN_CATEGORY_ID &&
    !!submission.portfolio;

  return (
    <article className="flex flex-col gap-3 py-2 md:flex-row md:gap-4">
      <SubmissionThumbnail submission={submission} onOpenImage={onOpenImage} />

      <div className="flex min-w-0 flex-1 flex-col gap-2 md:py-1">
        <div className="flex flex-col gap-0.5">
          <h3
            title={submission.title}
            className="truncate text-sm font-medium text-foreground"
          >
            {submission.title}
          </h3>
          {submission.description && (
            <p
              title={submission.description}
              className="line-clamp-3 text-xs text-muted-foreground"
            >
              {submission.description}
            </p>
          )}
        </div>

        <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-xs md:grid-cols-2">
          <DetailItem label="Categoria">{submission.categoryName}</DetailItem>
          <DetailItem label="Caricato">
            {formatAdminDate(submission.uploadedAt)}
          </DetailItem>
          {isPortfolio && (
            <DetailItem label="Portfolio">{submission.portfolio}</DetailItem>
          )}
          {isPortfolio && submission.portfolioPhotoType && (
            <DetailItem label="Tipo">
              <span className="capitalize">
                {formatPortfolioPhotoType(submission.portfolioPhotoType)}
              </span>
            </DetailItem>
          )}
          <DetailItem label="ID" className="md:col-span-2">
            <span className="break-all font-mono text-subtle-foreground">
              {submission.id}
            </span>
          </DetailItem>
        </dl>
      </div>
    </article>
  );
}
