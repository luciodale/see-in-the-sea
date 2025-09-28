import type { TranslationKey } from '../../i18n';
import { useI18n } from '../../i18n/react';
import type { UISubmission } from '../../types/ui';
import { ImageIcon } from './ImageIcon';
import { ManageButton } from './ManageButton';

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
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
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
        <button
          onClick={onUploadClick}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors cursor-pointer"
        >
          {t('action.upload-picture')}
        </button>
      )}

      {/* Payment status message */}
      {hasPaid && canAddMore && isContestActive && (
        <div className="w-full py-3 bg-slate-700 text-slate-300 rounded-lg font-medium text-center">
          {t('payment.submissions-locked')}
        </div>
      )}

      {/* Contest closed notice */}
      {canAddMore && !isContestActive && (
        <div className="bg-amber-900/30 border border-amber-700 text-amber-200 rounded-lg p-4 text-center">
          {t('submissions.closed')}
        </div>
      )}

      {/* Category full notice */}
      {!canAddMore && (
        <div className="bg-emerald-900/30 border border-emerald-700 text-emerald-200 rounded-lg p-4 text-center">
          {t('submissions.category-complete')}
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
              className="bg-slate-900 border border-slate-700 rounded-lg p-4"
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
    </div>
  );
}
