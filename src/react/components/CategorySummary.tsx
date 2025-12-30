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
          type="button"
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
        <div className="bg-gradient-to-r from-emerald-900/40 to-emerald-800/30 border border-emerald-600/50 text-emerald-100 rounded-xl p-5 text-center shadow-lg shadow-emerald-900/20">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg
              className="w-5 h-5 text-emerald-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-semibold text-emerald-200">
              {t('submissions.category-complete')}
            </span>
          </div>
          <p className="text-sm text-emerald-300/80">
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
              className="bg-slate-900 border border-slate-700 rounded-lg p-4"
            >
              {/* Success indicator banner */}
              <div className="flex items-center gap-2 mb-3 p-2 bg-emerald-900/20 border border-emerald-700/50 rounded-md">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-emerald-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-300">
                    {t('submissions.success-received')}
                  </p>
                  <p className="text-xs text-emerald-400/80">
                    {t('submissions.success-description')}
                  </p>
                </div>
              </div>
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
