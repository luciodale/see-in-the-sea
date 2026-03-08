import { memo, useCallback, useState } from 'react';
import { PHOTO_TYPES } from '../../../constants';
import type {
  FlagStatus,
  JudgingSubmission,
  Placement,
} from '../../types/judging';
import { getImageUrl } from '../../utils/imageUtils';
import { StatusBadges } from './StatusBadges';
import { VotingToolbar } from './VotingToolbar';

type PortfolioCardProps = {
  portfolioId: string;
  submissions: JudgingSubmission[];
  showImages?: boolean;
  onInspect: (id: string) => void;
  onFlag: (submissionIds: string[], status: FlagStatus) => void;
  onPlace: (
    submissionIds: string[],
    placement: Placement,
    categoryId: string
  ) => void;
};

export const PortfolioCard = memo(function PortfolioCard({
  portfolioId,
  submissions: portfolioSubmissions,
  showImages = false,
  onInspect,
  onFlag,
  onPlace,
}: PortfolioCardProps) {
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());

  const firstPhoto = portfolioSubmissions[0];
  if (!firstPhoto) return null;

  const isRejected = firstPhoto.flagStatus === 'rejected';
  const isIncomplete = portfolioSubmissions.length < PHOTO_TYPES.length;
  const photoCount = portfolioSubmissions.length;
  const photoByType = new Map(
    portfolioSubmissions.map(s => [s.portfolioPhotoType, s])
  );
  const submissionIds = portfolioSubmissions.map(s => s.id);

  const handleClick = () => onInspect(portfolioId);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onInspect(portfolioId);
    }
  };

  const handleFlag = useCallback(
    (status: FlagStatus) => onFlag(submissionIds, status),
    [onFlag, submissionIds]
  );

  const handlePlace = useCallback(
    (placement: Placement) =>
      onPlace(submissionIds, placement, firstPhoto.categoryId),
    [onPlace, submissionIds, firstPhoto.categoryId]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`relative rounded-xl overflow-hidden bg-slate-900 border-2 transition-all cursor-pointer group ${
        isRejected
          ? 'border-red-500/50 opacity-50'
          : isIncomplete
            ? 'border-orange-500/50'
            : firstPhoto.flagStatus === 'shortlisted'
              ? 'border-emerald-500/50'
              : firstPhoto.placement
                ? 'border-yellow-500/50'
                : 'border-slate-800 hover:border-slate-600'
      }`}
    >
      {showImages ? (
        <div className="grid grid-cols-3 gap-1 p-1">
          {PHOTO_TYPES.map(photoType => {
            const sub = photoByType.get(photoType);
            const imageUrl = sub?.r2ImageId ? getImageUrl(sub.r2ImageId) : null;
            const hasFailed = sub ? failedIds.has(sub.id) : false;

            return (
              <div
                key={photoType}
                className={`aspect-[4/3] relative ${sub ? 'bg-neutral-600' : 'bg-neutral-600/50'}`}
              >
                {sub && imageUrl && !hasFailed ? (
                  <img
                    src={imageUrl}
                    alt={sub.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    onError={() =>
                      setFailedIds(prev => new Set(prev).add(sub.id))
                    }
                  />
                ) : hasFailed ? (
                  <div className="w-full h-full flex items-center justify-center bg-red-950/50">
                    <span className="text-xl">&#9888;&#65039;</span>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <span className="text-xl">&#128444;&#65039;</span>
                  </div>
                )}
                <div className="absolute bottom-0.5 left-0.5 text-[9px] bg-black/70 text-slate-300 px-1 py-0.5 rounded capitalize">
                  {photoType.charAt(0)}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="aspect-[4/3] flex flex-col items-center justify-center gap-2 p-4">
          <div className="text-4xl">&#128444;&#65039;</div>
          <div className="flex items-center gap-1.5 text-sm">
            <span
              className={`font-medium ${isIncomplete ? 'text-orange-400' : 'text-slate-300'}`}
            >
              {photoCount}/{PHOTO_TYPES.length} foto
            </span>
          </div>
          <div className="flex gap-1 text-xs text-slate-500">
            {PHOTO_TYPES.map(type => {
              const hasType = portfolioSubmissions.some(
                s => s.portfolioPhotoType === type
              );
              return (
                <span
                  key={type}
                  className={`px-1.5 py-0.5 rounded ${hasType ? 'bg-slate-700 text-slate-300' : 'bg-slate-800 text-slate-600'}`}
                >
                  {type.charAt(0).toUpperCase()}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <StatusBadges
        placement={firstPhoto.placement}
        flagStatus={firstPhoto.flagStatus}
        size="small"
      />

      {/* Hover toolbar */}
      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black via-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <VotingToolbar
          flagStatus={firstPhoto.flagStatus}
          placement={firstPhoto.placement}
          onFlag={handleFlag}
          onPlace={handlePlace}
        />
      </div>

      <div className="px-3 py-2 bg-slate-900 text-center">
        <p className="text-xs text-slate-400">Portfolio</p>
      </div>
    </div>
  );
});
