import { useMemo } from 'react';
import { PHOTOS_PER_PORTFOLIO } from '../../constants';
import { useI18n } from '../../i18n/react';
import type { UISubmission } from '../../types/ui';
import { PhotoSlot } from './PhotoSlot';

type PortfolioGridProps = {
  portfolioNumber: 1 | 2;
  submissions: UISubmission[];
  hasPaid?: boolean;
  onUploadClick: (portfolio: string, portfolioPhotoType: string) => void;
  onManageSubmission: (submission: UISubmission) => void;
};

export function PortfolioGrid({
  portfolioNumber,
  submissions,
  hasPaid = false,
  onUploadClick,
  onManageSubmission,
}: PortfolioGridProps) {
  const { t } = useI18n();
  const portfolioSubmissions = useMemo(() => {
    return submissions.filter(s => s.portfolio === portfolioNumber.toString());
  }, [submissions, portfolioNumber]);

  const status = useMemo(() => {
    const hasMacro = portfolioSubmissions.some(
      s => s.portfolioPhotoType === 'macro'
    );
    const hasWideAngle = portfolioSubmissions.some(
      s => s.portfolioPhotoType === 'wide-angle'
    );
    const hasFree = portfolioSubmissions.some(
      s => s.portfolioPhotoType === 'free'
    );

    return {
      hasMacro,
      hasWideAngle,
      hasFree,
      isComplete: hasMacro && hasWideAngle && hasFree,
      count: portfolioSubmissions.length,
    };
  }, [portfolioSubmissions]);

  const photoSlots = useMemo(() => {
    return [
      { photoType: 'macro' as const, label: t('photo-type.macro') },
      { photoType: 'wide-angle' as const, label: t('photo-type.wide-angle') },
      { photoType: 'free' as const, label: t('photo-type.free') },
    ];
  }, [t]);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <h3 className="text-lg font-semibold text-white mb-4">
        {t('portfolio.title')} {portfolioNumber}
      </h3>
      <div className="grid grid-cols-3 gap-3 mb-4">
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
              hasPaid={hasPaid}
              onUploadClick={onUploadClick}
              onManageSubmission={onManageSubmission}
            />
          );
        })}
      </div>
      <div className="pt-4 border-t border-slate-700">
        <div className="flex items-center justify-center gap-2">
          {status.isComplete && (
            <svg
              aria-hidden="true"
              className="w-4 h-4 text-emerald-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <span
            className={`text-sm font-medium ${status.isComplete ? 'text-emerald-400' : 'text-slate-400'}`}
          >
            {status.isComplete
              ? t('portfolio.complete')
              : `${status.count}/${PHOTOS_PER_PORTFOLIO} ${t('portfolio.photos-count')}`}
          </span>
        </div>
      </div>
    </div>
  );
}
