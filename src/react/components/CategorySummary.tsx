import { useI18n } from '../../i18n/react';
import type { TranslationKey } from '../../i18n/translations';
import type { UISubmission } from '../../types/ui';
import { ImageIcon } from './ImageIcon';
import { ManageButton } from './ManageButton';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

type CategorySummaryProps = {
  categoryId: string;
  submissions: UISubmission[];
  maxSubmissionsPerCategory: number;
  contestStatus: 'active' | 'inactive' | 'assessment';
  hasPaid?: boolean;
  onUploadClick: () => void;
  onManageSubmission: (submission: UISubmission) => void;
};

export function CategorySummary({
  categoryId,
  submissions,
  maxSubmissionsPerCategory,
  contestStatus,
  hasPaid = false,
  onUploadClick,
  onManageSubmission,
}: CategorySummaryProps) {
  const { t } = useI18n();

  const canAddMore = submissions.length < maxSubmissionsPerCategory;
  const isContestActive = contestStatus === 'active';
  const canUpload = canAddMore && isContestActive && !hasPaid;

  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white mb-2">
          {t(`category.${categoryId}` as unknown as TranslationKey)}
        </h2>
        <p className="text-sm text-slate-400">
          {submissions.length === 0
            ? t('submissions.no-pictures-uploaded')
            : `${submissions.length} ${t('submissions.pictures-uploaded')}`}
        </p>
      </div>

      {/* Upload button */}
      {canUpload && (
        <Button variant="primary" size="md" onClick={onUploadClick}>
          {t('action.upload-picture')}
        </Button>
      )}

      {/* Payment status message */}
      {hasPaid && canAddMore && isContestActive && (
        <div className="py-2.5 px-4 bg-slate-700/40 text-slate-400 rounded-lg text-sm text-center">
          {t('payment.submissions-locked')}
        </div>
      )}

      {/* Contest closed notice */}
      {canAddMore && !isContestActive && (
        <Card variant="warning" className="p-4 text-center">
          {t('submissions.closed')}
        </Card>
      )}

      {/* Category full notice */}
      {!canAddMore && (
        <div className="bg-emerald-950/30 border border-emerald-800/30 text-emerald-200/90 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <svg
              aria-hidden="true"
              className="w-4 h-4 text-emerald-500/70"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">
              {t('submissions.category-complete')}
            </span>
          </div>
          <p className="text-xs text-emerald-300/50">
            {t('submissions.category-complete-description')}
          </p>
        </div>
      )}

      {/* Existing submissions */}
      {submissions.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-medium text-slate-300">
            {t('submissions.your-pictures')}
          </h3>
          {submissions.map(submission => (
            <div
              key={submission.id}
              className="bg-slate-900/50 border border-slate-700/40 rounded-lg p-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-24 h-18 rounded overflow-hidden flex-shrink-0">
                  <ImageIcon
                    variant="uploaded"
                    className="w-full h-full rounded"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate">
                    {submission.title}
                  </h4>
                  {submission.description && (
                    <p className="text-sm text-slate-400 line-clamp-1">
                      {submission.description}
                    </p>
                  )}
                </div>
                <ManageButton
                  onClick={() => onManageSubmission(submission)}
                  disabled={hasPaid}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
