import { useEffect, useState } from 'react';
import { useI18n } from '../../i18n/react';
import type { UISubmission } from '../../types/ui';

type UseEditSubmissionParams = {
  submission: UISubmission | null;
  isOpen: boolean;
  onUpdated: (submission: UISubmission) => void;
  onDelete: (submissionId: string) => void;
  onClose: () => void;
};

type UpdateResponse = {
  success: boolean;
  message?: string;
};

// Title and description of an existing submission. A title is always
// required, and the server refuses edits once the entry has been paid for.
export function useEditSubmission({
  submission,
  isOpen,
  onUpdated,
  onDelete,
  onClose,
}: UseEditSubmissionParams) {
  const { t } = useI18n();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reload the fields whenever another submission is opened
  useEffect(() => {
    if (!isOpen || !submission) return;
    setTitle(submission.title);
    setDescription(submission.description ?? '');
    setError(null);
  }, [isOpen, submission]);

  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  const isChanged =
    !!submission &&
    (trimmedTitle !== submission.title ||
      trimmedDescription !== (submission.description ?? ''));
  const canSave = trimmedTitle.length > 0 && isChanged;

  async function save() {
    if (!submission || !canSave || isSaving) return;

    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/update-submission', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: submission.id,
          title: trimmedTitle,
          description: trimmedDescription,
        }),
      });
      const result = (await response.json()) as UpdateResponse;

      if (!response.ok || !result.success) {
        throw new Error(result.message || t('error.upload-failed'));
      }

      onUpdated({
        ...submission,
        title: trimmedTitle,
        description: trimmedDescription || null,
      });
      onClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : t('error.upload-failed')
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function remove() {
    if (!submission || isDeleting) return;

    setIsDeleting(true);
    try {
      await onDelete(submission.id);
      onClose();
    } catch (deleteError) {
      console.error('Failed to delete submission:', deleteError);
    } finally {
      setIsDeleting(false);
    }
  }

  return {
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
  };
}
