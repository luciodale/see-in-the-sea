import type { AdminSubmission } from '../../../types/api';
import { useLightboxDialog } from '../../hooks/useImageLightbox';
import { getImageUrl } from '../../utils/imageUtils';
import { CloseIcon } from '../AdminIcons';

type SubmissionLightboxProps = {
  submission: AdminSubmission;
  onClose: () => void;
};

export function SubmissionLightbox({
  submission,
  onClose,
}: SubmissionLightboxProps) {
  const { dialogRef, closeButtonRef } = useLightboxDialog(onClose);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={submission.title}
      className="fixed inset-0 z-50 flex flex-col bg-popover"
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex min-w-0 flex-col">
          <p className="truncate text-sm font-medium text-foreground">
            {submission.title}
          </p>
          <p className="truncate text-xs text-subtle-foreground">
            {submission.categoryName}
          </p>
        </div>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Chiudi"
          className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors cursor-pointer hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Chiudi immagine"
        className="flex min-h-0 flex-1 items-center justify-center px-4 pb-4 cursor-zoom-out"
      >
        {/* Intrinsic sizing keeps the border on the image edge, so dark
            photos stay distinguishable from the backdrop */}
        {submission.r2ImageId && (
          <img
            src={getImageUrl(submission.r2ImageId)}
            alt={submission.title}
            className="max-h-full max-w-full border border-border-strong object-contain"
          />
        )}
      </button>
    </div>
  );
}
