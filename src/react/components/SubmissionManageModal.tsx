import { TrashIcon } from '@heroicons/react/24/outline';
import { useI18n } from '../../i18n/react';
import type { UISubmission } from '../../types/ui';
import { useEditSubmission } from '../hooks/useEditSubmission';
import { getImageUrl } from '../utils/imageUtils';
import { BaseModal } from './BaseModal';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input, Textarea } from './ui/Input';

type SubmissionManageModalProps = {
  submission: UISubmission | null;
  isOpen: boolean;
  hasPaid?: boolean;
  onClose: () => void;
  onDelete: (submissionId: string) => void;
  onUpdated: (submission: UISubmission) => void;
};

export function SubmissionManageModal({
  submission,
  isOpen,
  hasPaid = false,
  onClose,
  onDelete,
  onUpdated,
}: SubmissionManageModalProps) {
  const { t } = useI18n();
  const {
    title,
    description,
    setTitle,
    setDescription,
    error,
    isSaving,
    isDeleting,
    canSave,
    save,
    remove,
  } = useEditSubmission({ submission, isOpen, onUpdated, onDelete, onClose });

  if (!isOpen || !submission) {
    return null;
  }

  const isBusy = isSaving || isDeleting;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('modal.submission.title')}
      isLoading={isDeleting}
      loadingMessage={t('state.deleting')}
      loadingSubMessage={t('modal.please-wait')}
      maxWidth="lg"
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <div className="aspect-4/3 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-raised">
            <img
              src={
                submission.r2ImageId ? getImageUrl(submission.r2ImageId) : ''
              }
              alt={submission.title}
              className="size-full object-cover"
            />
          </div>
          <p className="min-w-0 font-light text-sm text-muted-foreground leading-paragraph">
            {t('modal.submission.edit-hint')}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Input
            id="submission-title"
            label={t('form.title')}
            value={title}
            onChange={event => setTitle(event.target.value)}
            placeholder={t('form.title-placeholder')}
            disabled={isBusy || hasPaid}
            maxLength={100}
          />
          <Textarea
            id="submission-description"
            label={t('form.description')}
            value={description}
            onChange={event => setDescription(event.target.value)}
            placeholder={t('form.description-placeholder')}
            disabled={isBusy || hasPaid}
            maxLength={500}
          />
        </div>

        {error && (
          <Card variant="danger" className="p-3 text-sm text-destructive">
            {error}
          </Card>
        )}

        <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          {!hasPaid && (
            <Button
              variant="outline"
              onClick={remove}
              disabled={isBusy}
              className="min-h-11 justify-center border-destructive/40 text-destructive hover:border-destructive hover:bg-destructive/10 hover:text-destructive sm:w-auto"
            >
              <TrashIcon aria-hidden="true" className="size-4" />
              {t('action.delete')}
            </Button>
          )}

          <div className="flex flex-col-reverse gap-3 sm:ml-auto sm:flex-row">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isBusy}
              className="min-h-11 w-full justify-center sm:w-auto"
            >
              {t('action.close')}
            </Button>
            {!hasPaid && (
              <Button
                variant="primary"
                onClick={save}
                loading={isSaving}
                disabled={!canSave || isBusy}
                className="min-h-11 w-full justify-center sm:w-auto"
              >
                {isSaving ? t('state.saving') : t('action.save')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
