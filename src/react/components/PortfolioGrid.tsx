import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useMemo } from 'react';
import { PHOTOS_PER_PORTFOLIO } from '../../constants';
import { useI18n } from '../../i18n/react';
import type { UISubmission } from '../../types/ui';
import {
  getPortfolioSubmissions,
  isPortfolioComplete,
} from '../utils/portfolio';
import { PhotoSlot } from './PhotoSlot';
import { cn } from './ui/cn';

type PortfolioGridProps = {
  portfolioNumber: number;
  submissions: UISubmission[];
  canUpload: boolean;
  isLocked: boolean;
  justUploadedId: string | null;
  onUploadClick: (portfolio: string, portfolioPhotoType: string) => void;
  onManageSubmission: (submission: UISubmission) => void;
};

export function PortfolioGrid({
  portfolioNumber,
  submissions,
  canUpload,
  isLocked,
  justUploadedId,
  onUploadClick,
  onManageSubmission,
}: PortfolioGridProps) {
  const { t } = useI18n();

  const portfolioSubmissions = useMemo(
    () => getPortfolioSubmissions(submissions, portfolioNumber),
    [submissions, portfolioNumber]
  );

  const isComplete = useMemo(
    () => isPortfolioComplete(submissions, portfolioNumber),
    [submissions, portfolioNumber]
  );

  const photoSlots = useMemo(
    () => [
      { photoType: 'macro' as const, label: t('photo-type.macro') },
      { photoType: 'wide-angle' as const, label: t('photo-type.wide-angle') },
      { photoType: 'free' as const, label: t('photo-type.free') },
    ],
    [t]
  );

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-4 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-xl text-foreground leading-heading">
          {t('portfolio.title')} {portfolioNumber}
        </h3>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-editorial uppercase tracking-editorial',
            isComplete ? 'text-success' : 'text-muted-foreground'
          )}
        >
          {isComplete && (
            <CheckCircleIcon aria-hidden="true" className="size-4 shrink-0" />
          )}
          {isComplete
            ? t('portfolio.complete')
            : `${portfolioSubmissions.length}/${PHOTOS_PER_PORTFOLIO} ${t('portfolio.photos-count')}`}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {photoSlots.map(({ photoType, label }) => {
          const submission = portfolioSubmissions.find(
            s => s.portfolioPhotoType === photoType
          );

          return (
            <PhotoSlot
              key={photoType}
              photoType={photoType}
              label={label}
              submission={submission}
              portfolioNumber={portfolioNumber}
              canUpload={canUpload}
              isLocked={isLocked}
              isJustUploaded={
                submission ? submission.id === justUploadedId : false
              }
              onUploadClick={onUploadClick}
              onManageSubmission={onManageSubmission}
            />
          );
        })}
      </div>
    </div>
  );
}
