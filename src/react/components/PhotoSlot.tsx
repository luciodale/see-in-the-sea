import type { PHOTO_TYPES } from '../../constants';
import type { UISubmission } from '../../types/ui';
import { SubmissionSlot } from './SubmissionSlot';

type PhotoSlotProps = {
  photoType: (typeof PHOTO_TYPES)[number];
  label: string;
  submission?: UISubmission;
  portfolioNumber: number;
  canUpload: boolean;
  isLocked: boolean;
  isJustUploaded: boolean;
  onUploadClick: (portfolio: string, portfolioPhotoType: string) => void;
  onManageSubmission: (submission: UISubmission) => void;
};

export function PhotoSlot({
  photoType,
  label,
  submission,
  portfolioNumber,
  canUpload,
  isLocked,
  isJustUploaded,
  onUploadClick,
  onManageSubmission,
}: PhotoSlotProps) {
  function handleUpload() {
    onUploadClick(String(portfolioNumber), photoType);
  }

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <SubmissionSlot
        submission={submission}
        label={label}
        aspect="aspect-square"
        canUpload={canUpload}
        isLocked={isLocked}
        isJustUploaded={isJustUploaded}
        onUpload={handleUpload}
        onManage={onManageSubmission}
      />
      <p className="flex min-h-8 w-full items-start justify-center text-center text-tiny uppercase tracking-editorial text-muted-foreground leading-tight break-words hyphens-auto">
        {label}
      </p>
    </div>
  );
}
