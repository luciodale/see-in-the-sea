import {
  ExclamationTriangleIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useI18n } from '../../i18n/react';
import { getImageUrl } from '../utils/imageUtils';
import { cn } from './ui/cn';

type SubmissionThumbProps = {
  r2ImageId: string | null;
  alt: string;
  className?: string;
};

export function SubmissionThumb({
  r2ImageId,
  alt,
  className,
}: SubmissionThumbProps) {
  const { t } = useI18n();
  // Tracked by id so a new photo in the same slot is not poisoned by an
  // earlier failure
  const [failedId, setFailedId] = useState<string | null>(null);
  const hasFailed = failedId !== null && failedId === r2ImageId;

  function handleError() {
    setFailedId(r2ImageId);
  }

  if (!r2ImageId || hasFailed) {
    const Icon = hasFailed ? ExclamationTriangleIcon : PhotoIcon;

    return (
      <span
        className={cn(
          'absolute inset-0 flex size-full items-center justify-center bg-surface-raised',
          className
        )}
      >
        <Icon
          aria-hidden="true"
          className={cn(
            'size-6',
            hasFailed ? 'text-destructive' : 'text-subtle-foreground'
          )}
        />
        <span className="sr-only">
          {hasFailed ? t('image.failed') : t('image.missing')}
        </span>
      </span>
    );
  }

  return (
    <img
      src={getImageUrl(r2ImageId)}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={handleError}
      className={cn('absolute inset-0 size-full object-cover', className)}
    />
  );
}
