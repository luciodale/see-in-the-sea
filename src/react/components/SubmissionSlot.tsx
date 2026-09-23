import {
  CheckIcon,
  LockClosedIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useI18n } from '../../i18n/react';
import type { UISubmission } from '../../types/ui';
import { SubmissionThumb } from './SubmissionThumb';
import { Badge } from './ui/Badge';
import { cn } from './ui/cn';

type SubmissionSlotProps = {
  submission?: UISubmission;
  label?: string;
  aspect: 'aspect-4/3' | 'aspect-square';
  canUpload: boolean;
  isLocked: boolean;
  isJustUploaded?: boolean;
  className?: string;
  onUpload: () => void;
  onManage: (submission: UISubmission) => void;
};

export function SubmissionSlot({
  submission,
  label,
  aspect,
  canUpload,
  isLocked,
  isJustUploaded = false,
  className,
  onUpload,
  onManage,
}: SubmissionSlotProps) {
  const { t } = useI18n();

  // Only the typed portfolio slots pass a label, and they carry the check chip
  const isTypedSlot = Boolean(label);

  function handleManage() {
    if (submission) onManage(submission);
  }

  if (submission) {
    return (
      <button
        type="button"
        onClick={handleManage}
        aria-label={[t('action.view-photo'), submission.title]
          .filter(Boolean)
          .join(': ')}
        className={cn(
          'relative block w-full overflow-hidden rounded-2xl border border-border bg-surface-raised transition-colors cursor-pointer hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          aspect,
          isJustUploaded &&
            'ring-1 ring-success/60 animate-in fade-in zoom-in-95 duration-500',
          className
        )}
      >
        <SubmissionThumb
          r2ImageId={submission.r2ImageId}
          alt={submission.title}
        />

        {isTypedSlot && (
          <span className="absolute left-1.5 top-1.5 flex size-5 items-center justify-center rounded-full border border-success/40 bg-background/80">
            <CheckIcon aria-hidden="true" className="size-3 text-success" />
          </span>
        )}

        {isJustUploaded && (
          <Badge
            variant="success"
            className="absolute right-1.5 top-1.5 text-tiny uppercase tracking-editorial"
          >
            {t('submissions.success-received')}
          </Badge>
        )}

        {submission.title && !isTypedSlot && (
          <span className="absolute inset-x-0 bottom-0 block bg-linear-to-t from-background/90 to-transparent p-3">
            <span className="block font-serif text-sm text-foreground leading-heading truncate">
              {submission.title}
            </span>
          </span>
        )}
      </button>
    );
  }

  if (canUpload) {
    return (
      <button
        type="button"
        onClick={onUpload}
        aria-label={[t('slot.add-photo'), label].filter(Boolean).join(': ')}
        className={cn(
          'group flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border-strong bg-surface p-4 text-center transition-colors cursor-pointer hover:border-foreground/40 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          aspect,
          className
        )}
      >
        <PlusIcon
          aria-hidden="true"
          className="size-6 text-muted-foreground group-hover:text-foreground"
        />
        <span className="text-editorial uppercase tracking-editorial text-foreground">
          {t('slot.add-photo')}
        </span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        'flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface p-4 text-center',
        aspect,
        className
      )}
    >
      {isLocked && (
        <LockClosedIcon
          aria-hidden="true"
          className="size-5 text-subtle-foreground"
        />
      )}
      <span className="text-editorial uppercase tracking-editorial text-subtle-foreground">
        {isLocked ? t('slot.locked') : t('slot.empty')}
      </span>
    </div>
  );
}
