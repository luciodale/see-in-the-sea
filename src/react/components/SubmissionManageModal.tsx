import clsx from 'clsx';
import { useState } from 'react';
import { useI18n } from '../../i18n/react';
import type { UISubmission } from '../../types/ui';
import { BaseModal } from './BaseModal';
import { OptimizedImage } from './OptimizedImage';

interface SubmissionManageModalProps {
  submission: UISubmission | null;
  isOpen: boolean;
  hasPaid?: boolean;
  onClose: () => void;
  onDelete: (submissionId: string) => void;
}

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
      {/* Content */}
      <div className="space-y-6">
        {/* Image */}
        <div className="w-full bg-slate-900 rounded-lg overflow-hidden">
          <OptimizedImage
            r2Key={submission.imageUrl}
            alt={submission.title}
            className="w-full h-auto max-h-96 object-contain"
            loading="eager"
          />
        </div>

        {/* Submission Details */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {submission.title}
            </h3>
            {submission.description && (
              <p className="text-slate-300 leading-relaxed">
                {submission.description}
              </p>
            )}
            {submission.portfolio && submission.portfolioPhotoType && (
              <div className="mt-3 text-sm text-slate-400">
                <p>Portfolio: {submission.portfolio}</p>
                <p>Type: {submission.portfolioPhotoType}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-slate-700">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 transition-colors cursor-pointer"
          >
            {t('action.close')}
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting || hasPaid}
            className={clsx(
              'flex-1 py-2 px-4 text-white rounded-lg transition-colors flex items-center justify-center gap-2',
              isDeleting || hasPaid
                ? 'bg-slate-600 cursor-not-allowed opacity-50'
                : 'bg-red-600 hover:bg-red-500 cursor-pointer'
            )}
          >
            {isDeleting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {isDeleting ? t('state.deleting') : t('action.delete')}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
