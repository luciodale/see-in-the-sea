import { useState } from 'react';
import { useI18n } from '../../i18n/react';
import type { UISubmission } from '../../types/ui';
import { getImageUrl } from '../utils/imageUtils';
import { BaseModal } from './BaseModal';
import { Button } from './ui/Button';

type SubmissionManageModalProps = {
  submission: UISubmission | null;
  isOpen: boolean;
  hasPaid?: boolean;
  onClose: () => void;
  onDelete: (submissionId: string) => void;
};

export function SubmissionManageModal({
  submission,
  isOpen,
  hasPaid = false,
  onClose,
  onDelete,
}: SubmissionManageModalProps) {
  const { t } = useI18n();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !submission) {
    return null;
  }

  const handleDelete = async () => {
    if (isDeleting || hasPaid) return;

    setIsDeleting(true);
    try {
      await onDelete(submission.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete submission:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('modal.submission.title')}
      isLoading={isDeleting}
      loadingMessage={t('state.deleting')}
      loadingSubMessage={t('modal.please-wait')}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        <div className="w-full bg-background border border-border rounded-xl overflow-hidden">
          <img
            src={submission.r2ImageId ? getImageUrl(submission.r2ImageId) : ''}
            alt={submission.title}
            className="w-full h-auto max-h-96 object-contain"
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <h3 className="font-serif text-2xl text-foreground leading-heading">
              {submission.title}
            </h3>
            {submission.description && (
              <p className="font-light text-sm sm:text-base text-foreground/80 leading-paragraph">
                {submission.description}
              </p>
            )}
            {submission.portfolio && submission.portfolioPhotoType && (
              <div className="space-y-1 pt-2">
                <p className="text-editorial uppercase tracking-editorial text-muted-foreground">
                  Portfolio: {submission.portfolio}
                </p>
                <p className="text-editorial uppercase tracking-editorial text-muted-foreground">
                  Type: {submission.portfolioPhotoType}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            fullWidth
            onClick={onClose}
            disabled={isDeleting}
          >
            {t('action.close')}
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={handleDelete}
            loading={isDeleting}
            disabled={isDeleting || hasPaid}
          >
            {isDeleting ? t('state.deleting') : t('action.delete')}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
