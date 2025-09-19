import { useState } from 'react';
import { useI18n } from '../../i18n/react';

type Submission = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
};

type SubmissionDisplayProps = {
  submission: Submission;
  onDelete: (submissionId: string) => void;
  onClose: () => void;
};

export function SubmissionDisplay({
  submission,
  onDelete,
  onClose,
}: SubmissionDisplayProps) {
  const { t } = useI18n();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(submission.id);
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              {t('modal.submission.title')}
            </h2>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="text-slate-400 hover:text-white disabled:opacity-50"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Image */}
            <div className="w-full bg-slate-900 rounded-lg overflow-hidden">
              {submission.imageUrl && (
                <img
                  src={`/api/images/${submission.imageUrl}`}
                  alt={submission.title}
                  className="w-full h-auto max-h-96 object-contain"
                />
              )}
            </div>

            {/* Details */}
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
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50"
              >
                {t('action.close')}
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-500 text-white rounded-lg disabled:opacity-50"
              >
                {isDeleting ? t('state.deleting') : t('action.delete')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
