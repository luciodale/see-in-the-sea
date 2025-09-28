import clsx from 'clsx';
import { PHOTO_TYPES } from '../../constants';
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
    <div className="text-center">
      {submission?.imageUrl ? (
        // Show image icon with manage button when image exists
        <div className="w-full">
          {/* Success indicator banner */}
          <div className="flex items-center justify-center gap-1 mb-2 p-1.5 bg-emerald-900/20 border border-emerald-700/50 rounded-md">
            <span className="text-xs font-medium text-emerald-300">
              {t('submissions.success-received')}
            </span>
          </div>

          <div className="w-full aspect-square bg-slate-700 rounded-lg overflow-hidden mb-2 relative">
            <ImageIcon className="w-full h-full rounded-lg" />
            <div className="absolute bottom-2 right-2">
              <ManageButton
                onClick={handleManageClick}
                className="text-xs px-2 py-1"
                disabled={hasPaid}
              />
            </div>
          </div>
        </div>
      ) : (
        // Show empty slot when no image exists
        <button
          onClick={hasPaid ? undefined : handleUploadClick}
          disabled={hasPaid}
          className={clsx(
            'w-full aspect-square rounded-lg overflow-hidden mb-2 transition-opacity',
            hasPaid
              ? 'cursor-not-allowed opacity-50'
              : 'hover:opacity-80 cursor-pointer'
          )}
        >
          <ImageIcon variant="empty" className="w-full h-full rounded-lg" />
        </button>
      )}
      <p className="text-xs text-slate-300">{label}</p>
    </div>
  );
}
