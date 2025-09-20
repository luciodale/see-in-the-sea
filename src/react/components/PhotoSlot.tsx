import { PHOTO_TYPES } from '../../constants';
import type { UISubmission } from '../../types/ui';
import { ImageIcon } from './ImageIcon';
import { ManageButton } from './ManageButton';

interface PhotoSlotProps {
  photoType: (typeof PHOTO_TYPES)[number];
  label: string;
  submission?: UISubmission;
  portfolioNumber: number;
  onUploadClick: (portfolio: string, portfolioPhotoType: string) => void;
  onManageSubmission: (submission: UISubmission) => void;
}

export function PhotoSlot({
  photoType,
  label,
  submission,
  portfolioNumber,
  onUploadClick,
  onManageSubmission,
}: PhotoSlotProps) {
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
        <div className="w-full aspect-square bg-slate-700 rounded-lg overflow-hidden mb-2 relative">
          <ImageIcon className="w-full h-full rounded-lg" />
          <div className="absolute bottom-2 right-2">
            <ManageButton
              onClick={handleManageClick}
              className="text-xs px-2 py-1"
            />
          </div>
        </div>
      ) : (
        // Show empty slot when no image exists
        <button
          onClick={handleUploadClick}
          className="w-full aspect-square rounded-lg overflow-hidden mb-2 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <ImageIcon variant="empty" className="w-full h-full rounded-lg" />
        </button>
      )}
      <p className="text-xs text-slate-300">{label}</p>
    </div>
  );
}
