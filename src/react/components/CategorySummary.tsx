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
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-serif text-xl text-foreground leading-heading">
            {t(`category.${categoryId}` as unknown as TranslationKey)}
          </h2>
          <p className="text-editorial uppercase tracking-editorial text-muted-foreground">
            {submissions.length === 0
              ? t('submissions.no-pictures-uploaded')
              : `${submissions.length} ${t('submissions.pictures-uploaded')}`}
          </p>
        </div>

        {canUpload && (
          <Button variant="primary" size="sm" onClick={onUploadClick}>
            {t('action.upload-picture')}
          </Button>
        )}
      </div>

      {hasPaid && canAddMore && isContestActive && (
        <p className="text-editorial uppercase tracking-editorial text-muted-foreground text-center">
          {t('payment.submissions-locked')}
        </p>
      )}

      {canAddMore && !isContestActive && (
        <Card variant="warning" className="p-4 text-center">
          {t('submissions.closed')}
        </Card>
      )}

      {!canAddMore && (
        <Card variant="success" className="p-5 text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <svg
              aria-hidden="true"
              className="w-4 h-4 text-success"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-editorial uppercase tracking-editorial text-foreground">
              {t('submissions.category-complete')}
            </span>
          </div>
          <p className="font-light text-sm text-muted-foreground leading-paragraph">
            {t('submissions.category-complete-description')}
          </p>
        </Card>
      )}

      {submissions.length > 0 && (
        <div className="space-y-3">
          <p className="text-editorial uppercase tracking-editorial-wider text-muted-foreground">
            {t('submissions.your-pictures')}
          </p>
          {submissions.map(submission => (
            <div
              key={submission.id}
              className="bg-surface border border-border rounded-xl p-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-24 h-18 rounded overflow-hidden flex-shrink-0">
                  <ImageIcon
                    variant="uploaded"
                    className="w-full h-full rounded"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif text-base text-foreground leading-heading truncate">
                    {submission.title}
                  </h4>
                  {submission.description && (
                    <p className="font-light text-sm text-muted-foreground line-clamp-1 leading-paragraph mt-1">
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
