import { PHOTOS_PER_PORTFOLIO, PHOTO_TYPES } from '../../constants';
import type { UISubmission } from '../../types/ui';
import { getImageUrl } from '../utils/imageUtils';

type PortfolioGridProps = {
  portfolioNumber: 1 | 2;
  submissions: UISubmission[];
  onUploadClick: (portfolio: string, portfolioPhotoType: string) => void;
  onDeleteClick: (submissionId: string) => void;
};

export function PortfolioGrid({
  portfolioNumber,
  submissions,
  onUploadClick,
  onDeleteClick,
}: PortfolioGridProps) {
  const portfolioSubmissions = submissions.filter(
    s => s.portfolio === portfolioNumber.toString()
  );

  const getPortfolioStatus = () => {
    const hasMacro = portfolioSubmissions.some(
      s => s.portfolioPhotoType === 'macro'
    );
    const hasWideAngle = portfolioSubmissions.some(
      s => s.portfolioPhotoType === 'wide-angle'
    );
    const hasFree = portfolioSubmissions.some(
      s => s.portfolioPhotoType === 'free'
    );

    return {
      hasMacro,
      hasWideAngle,
      hasFree,
      isComplete: hasMacro && hasWideAngle && hasFree,
      count: portfolioSubmissions.length,
    };
  };

  const status = getPortfolioStatus();

  const PhotoSlot = ({
    photoType,
    label,
  }: {
    photoType: (typeof PHOTO_TYPES)[number];
    label: string;
  }) => {
    const submission = portfolioSubmissions.find(
      s => s.portfolioPhotoType === photoType
    );

    return (
      <div className="text-center">
        {submission?.imageUrl ? (
          // Show image with delete button when image exists
          <div className="w-full aspect-square bg-slate-700 rounded-lg overflow-hidden mb-2 relative">
            <img
              src={getImageUrl(submission.imageUrl) || ''}
              alt={label}
              className="w-full h-full object-cover"
            />
            <button
              onClick={e => {
                e.stopPropagation();
                onDeleteClick(submission.id);
              }}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white text-xs px-2 py-1 rounded transition-colors"
            >
              Delete
            </button>
          </div>
        ) : (
          // Show upload button when no image exists
          <button
            onClick={() => onUploadClick(portfolioNumber.toString(), photoType)}
            className="w-full aspect-square bg-slate-700 rounded-lg overflow-hidden mb-2 hover:bg-slate-600 transition-colors group"
          >
            <div className="w-full h-full flex items-center justify-center">
              <button className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-2 rounded transition-colors">
                Click to upload
              </button>
            </div>
          </button>
        )}
        <p className="text-xs text-slate-300">{label}</p>
      </div>
    );
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-3">
        Portfolio {portfolioNumber}
      </h3>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <PhotoSlot photoType="macro" label="Macro" />
        <PhotoSlot photoType="wide-angle" label="Wide Angle" />
        <PhotoSlot photoType="free" label="Free Choice" />
      </div>
      <div className="pt-3 border-t border-slate-700">
        <span
          className={`text-sm font-medium ${status.isComplete ? 'text-emerald-400' : 'text-slate-400'}`}
        >
          {status.isComplete
            ? 'Complete'
            : `${status.count}/${PHOTOS_PER_PORTFOLIO} photos`}
        </span>
      </div>
    </div>
  );
}
