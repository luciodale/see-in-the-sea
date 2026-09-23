import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useMemo } from 'react';
import { useI18n } from '../../i18n/react';
import type { TranslationKey } from '../../i18n/translations';
import type { UISubmission } from '../../types/ui';
import { SubmissionSlot } from './SubmissionSlot';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { cn } from './ui/cn';

type CategorySummaryProps = {
  categoryId: string;
  submissions: UISubmission[];
  maxSubmissionsPerCategory: number;
  canUpload: boolean;
  isLocked: boolean;
  justUploadedId: string | null;
  onUploadClick: () => void;
  onManageSubmission: (submission: UISubmission) => void;
};

export function CategorySummary({
  categoryId,
  submissions,
  maxSubmissionsPerCategory,
  canUpload,
  isLocked,
  justUploadedId,
  onUploadClick,
  onManageSubmission,
}: CategorySummaryProps) {
  const { t } = useI18n();

  const hasFreeSlot = submissions.length < maxSubmissionsPerCategory;
  const isCategoryComplete = !hasFreeSlot;
  const isEmpty = submissions.length === 0;

  // Filled slots first, in submission order, then the remaining free slots
  const slots = useMemo(() => {
    return Array.from(
      { length: maxSubmissionsPerCategory },
      (_, index): { key: string; submission?: UISubmission } => {
        const submission = submissions[index];
        return {
          key: submission ? submission.id : `free-slot-${index}`,
          submission,
        };
      }
    );
  }, [submissions, maxSubmissionsPerCategory]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h2 className="font-serif text-xl text-foreground leading-heading">
            {t(`category.${categoryId}` as unknown as TranslationKey)}
          </h2>
          {!isEmpty && (
            <p className="text-editorial uppercase tracking-editorial text-muted-foreground">
              {`${submissions.length} ${t('submissions.pictures-uploaded')} · ${t('submissions.max-per-category')} ${maxSubmissionsPerCategory}`}
            </p>
          )}
        </div>

        {canUpload && !isEmpty && hasFreeSlot && (
          <Button variant="primary" size="sm" onClick={onUploadClick}>
            {t('action.upload-picture')}
          </Button>
        )}
      </div>

      {isEmpty && canUpload && (
        <p className="max-w-prose-narrow font-light text-sm text-muted-foreground leading-paragraph">
          {t('category.empty.body')}
        </p>
      )}

      <div
        className={cn(
          'grid grid-cols-2 gap-3 sm:gap-4',
          maxSubmissionsPerCategory >= 3 && 'sm:grid-cols-3'
        )}
      >
        {slots.map(({ key, submission }) => (
          <SubmissionSlot
            key={key}
            submission={submission}
            aspect="aspect-4/3"
            canUpload={canUpload}
            isLocked={isLocked}
            isJustUploaded={
              submission ? submission.id === justUploadedId : false
            }
            onUpload={onUploadClick}
            onManage={onManageSubmission}
          />
        ))}
      </div>

      {isCategoryComplete && (
        <Card
          variant="success"
          className="flex items-center gap-2 rounded-xl p-3"
        >
          <CheckCircleIcon
            aria-hidden="true"
            className="size-4 shrink-0 text-success"
          />
          <span className="text-editorial uppercase tracking-editorial text-foreground">
            {t('submissions.category-complete')}
          </span>
        </Card>
      )}
    </div>
  );
}
