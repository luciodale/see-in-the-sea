import { X, ZoomOut } from 'lucide-react';
import { useState } from 'react';
import type {
  FlagStatus,
  JudgingSubmission,
  Placement,
} from '../../types/judging';
import { PLACEMENTS } from '../../types/judging';
import { getImageUrl } from '../../utils/imageUtils';

type SubmissionInspectModalProps = {
  submission: JudgingSubmission;
  index: number;
  total: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  zoomLevel: number;
  zoomOrigin: { x: number; y: number };
  onZoomClick: (e: React.MouseEvent) => void;
  onResetZoom: () => void;
  descriptionExpanded: boolean;
  onToggleDescription: () => void;
  onFlag: (submissionId: string, status: FlagStatus) => void;
  onPlace: (submissionId: string, placement: Placement) => void;
};

export function SubmissionInspectModal({
  submission,
  index,
  total,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  onClose,
  zoomLevel,
  zoomOrigin,
  onZoomClick,
  onResetZoom,
  descriptionExpanded,
  onToggleDescription,
  onFlag,
  onPlace,
}: SubmissionInspectModalProps) {
  const [chromeVisible, setChromeVisible] = useState(false);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={submission.title}
      className="fixed inset-0 bg-neutral-700 z-50"
    >
      {/* Full-screen image */}
      <div
        role="button"
        tabIndex={0}
        className="absolute inset-0 overflow-auto flex items-center justify-center cursor-zoom-in"
        onClick={onZoomClick}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onZoomClick(e as unknown as React.MouseEvent);
          }
        }}
      >
        <img
          src={submission.r2ImageId ? getImageUrl(submission.r2ImageId) : ''}
          alt={submission.title}
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
            transition: 'transform 0.2s ease-out',
          }}
          className="max-w-full max-h-full object-contain"
          draggable={false}
        />
      </div>

      {/* Nav buttons — always visible */}
      <button
        type="button"
        onClick={onPrev}
        disabled={!canGoPrev}
        className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
          canGoPrev
            ? 'bg-black/60 hover:bg-black/80 text-white'
            : 'bg-black/20 text-slate-600 cursor-not-allowed'
        }`}
        aria-label="Foto precedente"
      >
        &larr;
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!canGoNext}
        className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
          canGoNext
            ? 'bg-black/60 hover:bg-black/80 text-white'
            : 'bg-black/20 text-slate-600 cursor-not-allowed'
        }`}
        aria-label="Foto successiva"
      >
        &rarr;
      </button>

      {/* Header — absolute, show on hover */}
      <div
        className="absolute top-0 inset-x-0 z-30"
        onMouseEnter={() => setChromeVisible(true)}
        onMouseLeave={() => setChromeVisible(false)}
      >
        {/* Hover target zone */}
        <div className="h-10" />
        <div
          className={`absolute top-0 inset-x-0 transition-all duration-200 ${
            chromeVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 -translate-y-full pointer-events-none'
          }`}
        >
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
            <div className="flex items-center gap-3 min-w-0">
              <div className="min-w-0">
                <div className="text-white text-sm font-medium truncate">
                  {submission.title}
                  <span className="text-slate-500 text-xs ml-2">
                    {index + 1}/{total}
                  </span>
                </div>
                {submission.description?.trim() && (
                  <button
                    type="button"
                    onClick={onToggleDescription}
                    className={`text-slate-400 text-xs text-left hover:text-slate-300 transition-colors ${descriptionExpanded ? '' : 'line-clamp-1'}`}
                  >
                    {submission.description}
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-slate-400 text-xs px-1.5 py-0.5 bg-slate-800 rounded">
                {Math.round(zoomLevel * 100)}%
              </span>
              {zoomLevel > 1 && (
                <button
                  type="button"
                  className="w-7 h-7 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center"
                  onClick={onResetZoom}
                  aria-label="Reimposta zoom"
                >
                  <ZoomOut className="w-3.5 h-3.5 text-white" />
                </button>
              )}
              <button
                type="button"
                className="w-8 h-8 bg-red-600 hover:bg-red-500 rounded-lg flex items-center justify-center"
                onClick={onClose}
                aria-label="Chiudi"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom voting toolbar — absolute, show on hover */}
      <div
        className="absolute bottom-0 inset-x-0 z-30"
        onMouseEnter={() => setChromeVisible(true)}
        onMouseLeave={() => setChromeVisible(false)}
      >
        {/* Hover target zone */}
        <div className="h-10" />
        <div
          className={`absolute bottom-0 inset-x-0 transition-all duration-200 ${
            chromeVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-full pointer-events-none'
          }`}
        >
          <div className="px-3 py-1.5 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800">
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              {/* Current status */}
              <div className="flex items-center gap-2 mr-4">
                {submission.placement && (
                  <span
                    className={`${PLACEMENTS.find(p => p.value === submission.placement)?.color} px-2 py-1 rounded text-xs font-bold`}
                  >
                    {
                      PLACEMENTS.find(p => p.value === submission.placement)
                        ?.label
                    }
                  </span>
                )}
                {submission.flagStatus !== 'pending' && (
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      submission.flagStatus === 'shortlisted'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {submission.flagStatus === 'shortlisted'
                      ? 'Selezionato'
                      : 'Scartato'}
                  </span>
                )}
              </div>

              <div className="w-px h-6 bg-slate-700" />

              {/* Flags */}
              <button
                type="button"
                onClick={() => onFlag(submission.id, 'shortlisted')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                  submission.flagStatus === 'shortlisted'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-700 text-emerald-400 hover:bg-emerald-600 hover:text-white'
                }`}
              >
                &#10003; Seleziona
              </button>
              <button
                type="button"
                onClick={() => onFlag(submission.id, 'rejected')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                  submission.flagStatus === 'rejected'
                    ? 'bg-red-500 text-white'
                    : 'bg-slate-700 text-red-400 hover:bg-red-600 hover:text-white'
                }`}
              >
                &#10007; Scarta
              </button>

              <div className="w-px h-6 bg-slate-700" />

              {/* Placements */}
              {PLACEMENTS.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => onPlace(submission.id, p.value)}
                  className={`w-8 h-8 rounded text-sm font-bold transition-all ${
                    submission.placement === p.value
                      ? `${p.color} text-white scale-110`
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {p.label}
                </button>
              ))}
              {submission.placement && (
                <button
                  type="button"
                  onClick={() => onPlace(submission.id, null)}
                  className="w-8 h-8 rounded text-sm bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white"
                >
                  &#10005;
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
