import clsx from 'clsx';
import type { PHOTO_TYPES } from '../../constants';
import { useI18n } from '../../i18n/react';
import type { UISubmission } from '../../types/ui';
import { ImageIcon } from './ImageIcon';
import { ManageButton } from './ManageButton';

interface PhotoSlotProps {
  photoType: (typeof PHOTO_TYPES)[number];
  label: string;
  submission?: UISubmission;
  portfolioNumber: number;
  hasPaid?: boolean;
  onUploadClick: (portfolio: string, portfolioPhotoType: string) => void;
  onManageSubmission: (submission: UISubmission) => void;
}

export function PhotoSlot({
  photoType,
  label,
  submission,
  portfolioNumber,
  hasPaid = false,
  onUploadClick,
  onManageSubmission,
}: PhotoSlotProps) {
  const { t } = useI18n();

  const handleUploadClick = () => {
    onUploadClick(portfolioNumber.toString(), photoType);
  };

  const handleManageClick = () => {
    if (submission) {
      onManageSubmission(submission);
    }
  };

  return (
    <div className="text-center space-y-2">
      {submission?.r2ImageId ? (
        <div className="w-full space-y-2">
          <p className="text-tiny uppercase tracking-editorial-wider text-success">
            {t('submissions.success-received')}
          </p>
          <div className="w-full aspect-square bg-surface-raised border border-border rounded-xl overflow-hidden relative">
            <ImageIcon className="w-full h-full rounded-xl" />
            <div className="absolute bottom-2 right-2">
              <ManageButton
                onClick={handleManageClick}
                className="text-tiny px-3 py-1"
                disabled={hasPaid}
              />
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={hasPaid ? undefined : handleUploadClick}
          disabled={hasPaid}
          className={clsx(
            'w-full aspect-square rounded-xl overflow-hidden transition-opacity',
            hasPaid
              ? 'cursor-not-allowed opacity-40'
              : 'hover:opacity-80 cursor-pointer'
          )}
        >
          <ImageIcon variant="empty" className="w-full h-full rounded-xl" />
        </button>
      )}
      <p className="text-tiny uppercase tracking-editorial-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
