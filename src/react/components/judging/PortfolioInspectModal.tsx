import { X, ZoomOut } from 'lucide-react';
import { useState } from 'react';
import type {
  FlagStatus,
  JudgingSubmission,
  Placement,
  PortfolioGroup,
} from '../../types/judging';
import { PLACEMENTS } from '../../types/judging';
import { getImageUrl } from '../../utils/imageUtils';

type PortfolioInspectModalProps = {
  portfolio: PortfolioGroup;
  portfolioIndex: number;
  portfoliosTotal: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  // Zoomed photo state
  zoomedPhoto: JudgingSubmission | null;
  zoomedPhotoIndex: number;
  zoomedImageUrl: string | null;
  canGoPrevPhoto: boolean;
  canGoNextPhoto: boolean;
  onOpenZoomedPhoto: (id: string) => void;
  onCloseZoomedPhoto: () => void;
  onPrevPhoto: () => void;
  onNextPhoto: () => void;
  // Zoom controls
  zoomLevel: number;
  zoomOrigin: { x: number; y: number };
  onZoomClick: (e: React.MouseEvent) => void;
  onResetZoom: () => void;
  // Description
  descriptionExpanded: boolean;
  onToggleDescription: () => void;
  // Voting
  onFlag: (submissionIds: string[], status: FlagStatus) => void;
  onPlace: (
    submissionIds: string[],
    placement: Placement,
    categoryId: string
  ) => void;
};

export function PortfolioInspectModal({
  portfolio,
  portfolioIndex,
  portfoliosTotal,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  onClose,
  zoomedPhoto,
  zoomedPhotoIndex,
  zoomedImageUrl,
  canGoPrevPhoto,
  canGoNextPhoto,
  onOpenZoomedPhoto,
  onCloseZoomedPhoto,
  onPrevPhoto,
  onNextPhoto,
  zoomLevel,
  zoomOrigin,
  onZoomClick,
  onResetZoom,
  descriptionExpanded,
  onToggleDescription,
  onFlag,
  onPlace,
}: PortfolioInspectModalProps) {
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());
  const [chromeVisible, setChromeVisible] = useState(false);
  const firstPhoto = portfolio.submissions[0];
  const submissionIds = portfolio.submissions.map(s => s.id);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Portfolio Preview"
      className="fixed inset-0 bg-neutral-700 z-50 flex flex-col"
    >
      {/* Single Photo Zoom Overlay */}
      {zoomedPhoto && (
        <div className="absolute inset-0 bg-neutral-700 z-60">
          {/* Full-screen image */}
          {/* biome-ignore lint/a11y/useSemanticElements: interactive zoom overlay with complex content */}
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
            {zoomedImageUrl ? (
              <img
                src={zoomedImageUrl}
                alt={zoomedPhoto.title || 'Photo'}
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                  transition: 'transform 0.2s ease-out',
                }}
                className="max-w-full max-h-full object-contain"
                draggable={false}
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-center">
                <span className="text-5xl">&#9888;&#65039;</span>
                <span className="text-red-400 font-medium">
                  Impossibile caricare l&apos;immagine
                </span>
              </div>
            )}
          </div>

          {/* Nav buttons — always visible */}
          <button
            type="button"
            onClick={onPrevPhoto}
            disabled={!canGoPrevPhoto}
            className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
              canGoPrevPhoto
                ? 'bg-white/20 hover:bg-white/30 text-white'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
          >
            &larr;
          </button>
          <button
            type="button"
            onClick={onNextPhoto}
            disabled={!canGoNextPhoto}
            className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
              canGoNextPhoto
                ? 'bg-white/20 hover:bg-white/30 text-white'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
          >
            &rarr;
          </button>

          {/* Header — absolute, show on hover */}
          {/* biome-ignore lint/a11y/noStaticElementInteractions: hover zone for showing/hiding chrome UI */}
          <div
            className="absolute top-0 inset-x-0 z-30"
            onMouseEnter={() => setChromeVisible(true)}
            onMouseLeave={() => setChromeVisible(false)}
          >
            <div className="h-10" />
            <div
              className={`absolute top-0 inset-x-0 transition-all duration-200 ${
                chromeVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 -translate-y-full pointer-events-none'
              }`}
            >
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onCloseZoomedPhoto}
                    className="text-slate-400 hover:text-white text-xs flex items-center gap-1"
                  >
                    &larr; Portfolio
                  </button>
                  <div className="text-white text-sm font-medium capitalize">
                    {zoomedPhoto.portfolioPhotoType}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
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
                    onClick={onCloseZoomedPhoto}
                    aria-label="Chiudi zoom"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer — absolute, show on hover */}
          {/* biome-ignore lint/a11y/noStaticElementInteractions: hover zone for showing/hiding chrome UI */}
          <div
            className="absolute bottom-0 inset-x-0 z-30"
            onMouseEnter={() => setChromeVisible(true)}
            onMouseLeave={() => setChromeVisible(false)}
          >
            <div className="h-10" />
            <div
              className={`absolute bottom-0 inset-x-0 transition-all duration-200 ${
                chromeVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-full pointer-events-none'
              }`}
            >
              <div className="px-3 py-1 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800 text-center">
                <div className="text-xs text-slate-300">
                  {zoomedPhotoIndex + 1} / {portfolio.submissions.length}
                  {zoomedPhoto.title && (
                    <span className="ml-3 text-slate-500">
                      {zoomedPhoto.title}
                    </span>
                  )}
                </div>
                {zoomedPhoto.description?.trim() && (
                  <button
                    type="button"
                    onClick={onToggleDescription}
                    className={`text-xs text-slate-400 mt-1 max-w-md mx-auto hover:text-slate-300 transition-colors ${descriptionExpanded ? '' : 'line-clamp-2'}`}
                  >
                    {zoomedPhoto.description}
                    {!descriptionExpanded &&
                      zoomedPhoto.description.length > 100 && (
                        <span className="text-accent-hover ml-1">...</span>
                      )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-white text-sm font-medium">
              Portfolio Mediterranean
              <span className="text-slate-500 text-xs ml-2">
                {portfolioIndex + 1}/{portfoliosTotal}
              </span>
            </div>
            <div className="text-slate-500 text-xs">
              Frecce &larr;&rarr; per navigare &bull; Clicca foto per ingrandire
            </div>
          </div>
        </div>
        <button
          type="button"
          className="w-8 h-8 bg-red-600 hover:bg-red-500 rounded-lg flex items-center justify-center"
          onClick={onClose}
          aria-label="Chiudi"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Main content with nav buttons */}
      <div className="flex-1 min-h-0 flex items-stretch relative">
        <button
          type="button"
          onClick={onPrev}
          disabled={!canGoPrev}
          className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
            canGoPrev
              ? 'bg-white/20 hover:bg-white/30 text-white'
              : 'bg-white/5 text-white/30 cursor-not-allowed'
          }`}
        >
          &larr;
        </button>

        <div className="flex-1 p-2 flex items-center justify-center gap-4 overflow-auto">
          {portfolio.submissions.map(sub => {
            const imageUrl = sub.r2ImageId ? getImageUrl(sub.r2ImageId) : null;
            const hasFailed = failedIds.has(sub.id);
            return (
              // biome-ignore lint/a11y/useSemanticElements: card acts as button with complex inner content
              <div
                key={sub.id}
                role="button"
                tabIndex={0}
                onClick={() => onOpenZoomedPhoto(sub.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpenZoomedPhoto(sub.id);
                  }
                }}
                className="flex-1 max-w-lg flex flex-col bg-slate-900 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-emerald-500/50 transition-all group"
              >
                <div className="aspect-[4/3] bg-neutral-600 relative overflow-hidden">
                  {imageUrl && !hasFailed ? (
                    <img
                      src={imageUrl}
                      alt={sub.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      onError={() =>
                        setFailedIds(prev => new Set(prev).add(sub.id))
                      }
                    />
                  ) : hasFailed ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-red-950/50 gap-2">
                      <span className="text-3xl">&#9888;&#65039;</span>
                      <span className="text-xs text-red-400">
                        Errore caricamento
                      </span>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                      <span className="text-3xl">&#128444;&#65039;</span>
                      <span className="text-xs">Nessuna immagine</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <span className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-3 py-1.5 rounded-full">
                      &#128269; Clicca per zoom
                    </span>
                  </div>
                </div>
                <div className="p-3 text-center bg-slate-900">
                  <span className="text-sm text-slate-300 capitalize font-medium">
                    {sub.portfolioPhotoType}
                  </span>
                  {sub.title && (
                    <p className="text-xs text-slate-500 truncate mt-1">
                      {sub.title}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
            canGoNext
              ? 'bg-white/20 hover:bg-white/30 text-white'
              : 'bg-white/5 text-white/30 cursor-not-allowed'
          }`}
        >
          &rarr;
        </button>
      </div>

      {/* Bottom voting toolbar */}
      <div className="shrink-0 border-t border-slate-800 bg-slate-900 px-3 py-1.5">
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {/* Current status */}
          <div className="flex items-center gap-2">
            {firstPhoto?.placement && (
              <span
                className={`${PLACEMENTS.find(p => p.value === firstPhoto.placement)?.color} px-3 py-1 rounded-full text-xs font-bold`}
              >
                {PLACEMENTS.find(p => p.value === firstPhoto.placement)?.label}
              </span>
            )}
            {firstPhoto?.flagStatus !== 'pending' && (
              <span
                className={`px-2 py-1 rounded text-xs ${
                  firstPhoto?.flagStatus === 'shortlisted'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {firstPhoto?.flagStatus === 'shortlisted'
                  ? 'Selezionato'
                  : 'Scartato'}
              </span>
            )}
          </div>

          <div className="w-px h-6 bg-slate-700" />

          {/* Flags */}
          <button
            type="button"
            onClick={() => onFlag(submissionIds, 'shortlisted')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
              firstPhoto?.flagStatus === 'shortlisted'
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-700 text-emerald-400 hover:bg-emerald-600 hover:text-white'
            }`}
          >
            &#10003; Seleziona
          </button>
          <button
            type="button"
            onClick={() => onFlag(submissionIds, 'rejected')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
              firstPhoto?.flagStatus === 'rejected'
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
              onClick={() =>
                onPlace(submissionIds, p.value, firstPhoto?.categoryId || '')
              }
              className={`w-8 h-8 rounded text-sm font-bold transition-all ${
                firstPhoto?.placement === p.value
                  ? `${p.color} text-white scale-110`
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {p.label}
            </button>
          ))}
          {firstPhoto?.placement && (
            <button
              type="button"
              onClick={() =>
                onPlace(submissionIds, null, firstPhoto?.categoryId || '')
              }
              className="w-8 h-8 rounded text-sm bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white"
            >
              &#10005;
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
